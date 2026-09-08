import * as ShiprocketService from "../services/shiprocket.service.js";
import { getOrderById, getOrderItems, updateShiprocketInfo, updateShippingStatus } from "../models/orderModel.js";
import * as NotificationService from "../services/notificationService.js";
import { sendShipmentCreatedEmail } from "../services/emailService.js";
import { getIO } from "../socket/index.js";

const PICKUP_LOCATION_NAME = process.env.SHIPROCKET_PICKUP_LOCATION_NAME;

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

    if (order.shipment_id) {
      return res.status(400).json({
        success: false,
        message: "Shipment already exists for this order.",
      });
    }

    // getOrderById does not include line items — fetch them separately.
    const items = await getOrderItems(orderId);
    if (!items.length) {
      return res.status(400).json({ success: false, message: "Order has no items." });
    }

    const shipmentResult = await ShiprocketService.createShipment(
      order,
      items,
      PICKUP_LOCATION_NAME
    );

    const awbResult = await ShiprocketService.assignCourierAndGenerateAWB(
      shipmentResult.shipment_id
    );

    const labelResult = await ShiprocketService.generateLabel(shipmentResult.shipment_id);
    const invoiceResult = await ShiprocketService.generateInvoice(shipmentResult.order_id);

    let pickupResult = null;
    try {
      pickupResult = await ShiprocketService.schedulePickup(shipmentResult.shipment_id);
    } catch (pickupError) {
      console.warn("Pickup scheduling failed, shipment still saved:", pickupError.message);
    }

    await updateShiprocketInfo(orderId, {
      shiprocket_order_id: shipmentResult.order_id,
      shipment_id: shipmentResult.shipment_id,
      awb_number: awbResult.awb_code,
      courier_name: awbResult.courier_name,
      shipping_label_url: labelResult.label_url,
      invoice_url: invoiceResult.invoice_url,
      pickup_scheduled: !!pickupResult,
    });

    await NotificationService.createNotification({
      title: "Shipment Created",
      body: `Order #${order.order_number} has been handed to ${awbResult.courier_name} for delivery.`,
      type: "order",
      referenceId: orderId,
    });

    try {
      await sendShipmentCreatedEmail({
        to: order.customer_email,
        customerName: order.customer_name,
        orderNumber: order.order_number,
        awbNumber: awbResult.awb_code,
        courierName: awbResult.courier_name,
      });
    } catch (emailError) {
      console.warn("Shipment email failed to send:", emailError.message);
    }

    try {
      getIO().to(`user:${order.user_id}`).emit("order:shipping-updated", {
        orderId,
        shipping_status: "Shipment Created",
        awb_number: awbResult.awb_code,
        courier_name: awbResult.courier_name,
      });
    } catch (err) {
      console.warn("Socket emit skipped:", err.message);
    }

    res.json({
      success: true,
      message: pickupResult
        ? "Shipment created and pickup scheduled."
        : "Shipment created — pickup scheduling failed, retry separately.",
      data: {
        shiprocket_order_id: shipmentResult.order_id,
        shipment_id: shipmentResult.shipment_id,
        awb_number: awbResult.awb_code,
        courier_name: awbResult.courier_name,
        label_url: labelResult.label_url,
        invoice_url: invoiceResult.invoice_url,
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
    if (!order || !order.awb_number) {
      return res.status(404).json({ success: false, message: "No shipment found for this order." });
    }

    const data = await ShiprocketService.trackShipment(order.awb_number);

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
      PICKUP_LOCATION_NAME
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
    const data = await ShiprocketService.generateLabel(order.shipment_id);
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
    const data = await ShiprocketService.generateInvoice(order.shiprocket_order_id);
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
