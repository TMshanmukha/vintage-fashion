import * as ShiprocketService from "../services/shiprocket.service.js";
import { getOrderById, getOrderItems, updateShiprocketInfo, updateShippingStatus } from "../models/orderModel.js";
import * as NotificationService from "../services/notificationService.js";
import { sendShipmentCreatedEmail } from "../services/emailService.js";
import { getIO } from "../socket/index.js";

const getPickupLocationName = () =>
  process.env.SHIPROCKET_PICKUP_LOCATION_NAME || "Primary";

export async function checkServiceability(req, res, next) {
  try {
    const { deliveryPincode, weight, declaredValue } = req.query;
    const data = await ShiprocketService.checkServiceability({
      pickupPincode: process.env.SHIPROCKET_PICKUP_PINCODE,
      deliveryPincode,
      weight: weight || 0.5,
      declaredValue: declaredValue || 500,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getCouriers(req, res, next) {
  try {
    const { deliveryPincode } = req.query;
    const data = await ShiprocketService.getCourierRecommendation({
      pickupPincode: process.env.SHIPROCKET_PICKUP_PINCODE,
      deliveryPincode,
      weight: 0.5,
      declaredValue: 500,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

// Full pipeline: create shipment -> AWB -> label -> invoice -> pickup.
export async function createFullShipment(req, res, next) {
  try {
    const { orderId } = req.params;

    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    if (order.shipment_id && order.awb_number) {
      return res.status(400).json({
        success: false,
        message: "Shipment and AWB already assigned for this order.",
      });
    }

    let shipmentResult = {
      order_id: order.shiprocket_order_id,
      shipment_id: order.shipment_id,
    };

    // If shipment was not already created in Shiprocket, create it now
    if (!order.shipment_id) {
      const items = await getOrderItems(orderId);
      if (!items.length) {
        return res.status(400).json({ success: false, message: "Order has no items." });
      }

      shipmentResult = await ShiprocketService.createShipment(
        order,
        items,
        getPickupLocationName()
      );
    }

    const currentShipmentId = shipmentResult.shipment_id || shipmentResult.data?.shipment_id;
    const currentOrderId = shipmentResult.order_id || shipmentResult.data?.order_id || order.shiprocket_order_id;

    // 1. Assign Courier & Generate AWB
    let awbResult = null;
    let awbCode = order.awb_number || null;
    let courierName = order.courier_name || null;

    if (!awbCode && currentShipmentId) {
      try {
        awbResult = await ShiprocketService.assignCourierAndGenerateAWB(currentShipmentId);
        awbCode = awbResult?.awb_code || awbResult?.response?.data?.awb_code || awbResult?.data?.awb_code || null;
        courierName = awbResult?.courier_name || awbResult?.response?.data?.courier_name || awbResult?.data?.courier_name || (awbCode ? "Assigned Courier" : null);
      } catch (awbError) {
        console.warn("AWB generation notice (requires Shiprocket wallet balance):", awbError.response?.data?.message || awbError.message);
      }
    }

    // 2. If AWB not directly assigned, check if already assigned in Shiprocket dashboard (e.g. after 'Ship Now')
    if (!awbCode && currentOrderId) {
      try {
        const srDetails = await ShiprocketService.getOrderDetails(currentOrderId);
        const srData = srDetails?.data || srDetails;
        const srShipment = srData?.shipments?.[0] || srData?.shipment || {};
        if (srShipment?.awb || srData?.awb_code) {
          awbCode = srShipment?.awb || srData?.awb_code;
          courierName = srShipment?.courier_name || srData?.courier_name || "Assigned Courier";
        }
      } catch (checkErr) {
        console.warn("Shiprocket order detail check skipped:", checkErr.message);
      }
    }

    // 3. Generate Label (requires shipment_id and assigned AWB)
    let labelUrl = order.shipping_label_url || null;
    if (!labelUrl && currentShipmentId && awbCode) {
      try {
        const labelResult = await ShiprocketService.generateLabel(currentShipmentId);
        labelUrl = labelResult?.label_url || labelResult?.response?.label_url || labelResult?.data?.label_url || null;
      } catch (labelError) {
        console.warn("Label generation notice:", labelError.response?.data?.message || labelError.message);
      }
    }

    // 4. Generate Tax Invoice
    let invoiceUrl = order.invoice_url || null;
    if (!invoiceUrl && currentOrderId) {
      try {
        const invoiceResult = await ShiprocketService.generateInvoice(currentOrderId);
        invoiceUrl = invoiceResult?.invoice_url || invoiceResult?.response?.invoice_url || invoiceResult?.data?.invoice_url || null;
      } catch (invError) {
        console.warn("Invoice generation notice:", invError.response?.data?.message || invError.message);
      }
    }

    // 5. Schedule Pickup (optional)
    let pickupResult = null;
    if (currentShipmentId && awbCode) {
      try {
        pickupResult = await ShiprocketService.schedulePickup(currentShipmentId);
      } catch (pickupError) {
        console.warn("Pickup scheduling notice:", pickupError.response?.data?.message || pickupError.message);
      }
    }

    // Persist to database
    await updateShiprocketInfo(orderId, {
      shiprocket_order_id: currentOrderId,
      shipment_id: currentShipmentId,
      awb_number: awbCode || null,
      courier_name: courierName || "Shiprocket Express",
      shipping_label_url: labelUrl || null,
      invoice_url: invoiceUrl || null,
      pickup_scheduled: !!pickupResult,
    });

    await updateShippingStatus(orderId, {
      shipping_status: awbCode ? "In Transit" : "Invoiced (Ready to Ship)",
    });

    // Send shipment email ONLY if AWB is generated
    if (awbCode) {
      try {
        await sendShipmentCreatedEmail({
          to: order.customer_email,
          customerName: order.customer_name,
          orderNumber: order.order_number,
          awbNumber: awbCode,
          courierName: courierName || "Express Courier",
        });
      } catch (emailError) {
        console.warn("Shipment email failed to send:", emailError.message);
      }
    }

    try {
      getIO().to(`user:${order.user_id}`).emit("order:shipping-updated", {
        orderId,
        shipping_status: awbCode ? "In Transit" : "Invoiced",
        awb_number: awbCode || null,
        courier_name: courierName || "Shiprocket Express",
      });
      getIO().to("admins").emit("admin:order-updated", {
        orderId,
        shipping_status: awbCode ? "In Transit" : "Invoiced",
        awb_number: awbCode || null,
      });
    } catch (err) {
      console.warn("Socket emit skipped:", err.message);
    }

    res.json({
      success: true,
      message: awbCode
        ? `Shipment created with ${courierName}. AWB: ${awbCode}`
        : "Order created in Shiprocket (Invoiced). To assign AWB and generate courier label, please recharge Shiprocket wallet or click 'Ship Now' in Shiprocket dashboard.",
      data: {
        shiprocket_order_id: currentOrderId,
        shipment_id: currentShipmentId,
        awb_number: awbCode || null,
        courier_name: courierName || "Shiprocket Express",
        label_url: labelUrl,
        invoice_url: invoiceUrl,
        pickup_scheduled: !!pickupResult,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function trackByOrderId(req, res, next) {
  try {
    const { orderId } = req.params;
    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    let awb = order.awb_number;

    // If AWB is missing locally, check Shiprocket live order details
    if (!awb && order.shiprocket_order_id) {
      try {
        const srDetails = await ShiprocketService.getOrderDetails(order.shiprocket_order_id);
        const srData = srDetails?.data || srDetails;
        const srShipment = srData?.shipments?.[0] || srData?.shipment || {};
        if (srShipment?.awb || srData?.awb_code) {
          awb = srShipment?.awb || srData?.awb_code;
          await updateShiprocketInfo(orderId, {
            shiprocket_order_id: order.shiprocket_order_id,
            shipment_id: order.shipment_id,
            awb_number: awb,
            courier_name: srShipment?.courier_name || srData?.courier_name || "Assigned Courier",
            shipping_label_url: order.shipping_label_url,
            invoice_url: order.invoice_url,
            pickup_scheduled: order.pickup_scheduled,
          });
        }
      } catch (err) {
        console.warn("Could not sync AWB from Shiprocket:", err.message);
      }
    }

    if (!awb) {
      return res.status(400).json({
        success: false,
        message: "AWB tracking number is not assigned yet. Please assign courier/recharge wallet in Shiprocket (or click Ship Now) to generate live tracking."
      });
    }

    const data = await ShiprocketService.trackShipment(awb);

    const currentStatus = data?.tracking_data?.shipment_track?.[0]?.current_status;
    if (currentStatus) {
      const isDelivered = /delivered/i.test(currentStatus);
      await updateShippingStatus(orderId, {
        shipping_status: currentStatus,
        delivered_at: isDelivered ? new Date() : null,
      });

      try {
        getIO().to(`user:${order.user_id}`).emit("order:shipping-updated", {
          orderId,
          shipping_status: currentStatus,
        });
      } catch (err) {
        console.warn("Socket emit skipped:", err.message);
      }
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function schedulePickup(req, res, next) {
  try {
    const { orderId } = req.params;
    const order = await getOrderById(orderId);
    if (!order?.shipment_id) {
      return res.status(400).json({ success: false, message: "No shipment exists yet." });
    }
    const data = await ShiprocketService.schedulePickup(order.shipment_id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function cancel(req, res, next) {
  try {
    const { orderId } = req.params;
    const order = await getOrderById(orderId);
    if (!order?.awb_number) {
      return res.status(400).json({ success: false, message: "No AWB to cancel." });
    }

    const data = await ShiprocketService.cancelShipment(order.awb_number);

    await updateShippingStatus(orderId, { shipping_status: "Cancelled" });

    await NotificationService.createNotification({
      title: "Shipment Cancelled",
      body: `Order #${order.order_number}'s shipment was cancelled.`,
      type: "order",
      referenceId: orderId,
    });

    try {
      getIO().to(`user:${order.user_id}`).emit("order:status-changed", {
        orderId,
        order_status: "cancelled",
      });
    } catch (err) {
      console.warn("Socket emit skipped:", err.message);
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function createReturn(req, res, next) {
  try {
    const { orderId } = req.params;
    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    // Same fix as createFullShipment — items must be fetched separately.
    const items = await getOrderItems(orderId);

    const data = await ShiprocketService.createReturnShipment(
      order,
      req.body.returnRequest,
      items,
      getPickupLocationName()
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getLabel(req, res, next) {
  try {
    const { orderId } = req.params;
    const order = await getOrderById(orderId);
    if (!order?.shipment_id) {
      return res.status(400).json({ success: false, message: "No shipment exists yet." });
    }
    if (order.shipping_label_url) {
      return res.json({ success: true, data: { label_url: order.shipping_label_url } });
    }
    const data = await ShiprocketService.generateLabel(order.shipment_id);
    const url = data?.label_url || data?.response?.label_url || data?.data?.label_url || null;
    if (url) {
      await updateShiprocketInfo(orderId, {
        shiprocket_order_id: order.shiprocket_order_id,
        shipment_id: order.shipment_id,
        awb_number: order.awb_number,
        courier_name: order.courier_name,
        shipping_label_url: url,
        invoice_url: order.invoice_url,
        pickup_scheduled: order.pickup_scheduled,
      });
    }
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getInvoice(req, res, next) {
  try {
    const { orderId } = req.params;
    const order = await getOrderById(orderId);
    if (!order?.shiprocket_order_id) {
      return res.status(400).json({ success: false, message: "No shipment exists yet." });
    }
    if (order.invoice_url) {
      return res.json({ success: true, data: { invoice_url: order.invoice_url } });
    }
    const data = await ShiprocketService.generateInvoice(order.shiprocket_order_id);
    const url = data?.invoice_url || data?.response?.invoice_url || data?.data?.invoice_url || null;
    if (url) {
      await updateShiprocketInfo(orderId, {
        shiprocket_order_id: order.shiprocket_order_id,
        shipment_id: order.shipment_id,
        awb_number: order.awb_number,
        courier_name: order.courier_name,
        shipping_label_url: order.shipping_label_url,
        invoice_url: url,
        pickup_scheduled: order.pickup_scheduled,
      });
    }
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getManifest(req, res, next) {
  try {
    const { orderId } = req.params;
    const order = await getOrderById(orderId);
    if (!order?.shipment_id) {
      return res.status(400).json({ success: false, message: "No shipment exists yet." });
    }
    const data = await ShiprocketService.generateManifest(order.shipment_id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
