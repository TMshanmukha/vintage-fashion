import shiprocketApi from "../config/shiprocket.js";
import { getOrderById, updateShiprocketInfo, updateShippingStatus, updateOrderStatus } from "../models/orderModel.js";
import * as NotificationService from "../services/notificationService.js";

// ==========================================================
// SERVICEABILITY — check if a pincode combination is deliverable,
// and what prepaid-only courier options/rates exist for it.
// ==========================================================
export async function checkServiceability({ pickupPincode, deliveryPincode, weight, declaredValue }) {
  const { data } = await shiprocketApi.get("/courier/serviceability/", {
    params: {
      pickup_postcode: pickupPincode,
      delivery_postcode: deliveryPincode,
      weight,          // in kg
      cod: 0,           // prepaid only — no COD
      declared_value: declaredValue,
    },
  });
  return data;
}

// ==========================================================
// COURIER RECOMMENDATION — same underlying endpoint as
// serviceability; Shiprocket returns available couriers + rates
// sorted so you can pick the cheapest/fastest.
// ==========================================================
export async function getCourierRecommendation(params) {
  return checkServiceability(params);
}

// ==========================================================
// CREATE SHIPMENT (Order + Shipment in one call — Shiprocket's
// "Create Order" endpoint creates both simultaneously)
// ==========================================================
export async function createShipment(order, items, pickupLocationName) {
  const payload = {
    order_id: String(order.order_number),   // must be unique per Shiprocket account
    order_date: new Date(order.ordered_at).toISOString().slice(0, 19).replace("T", " "),
    pickup_location: pickupLocationName,     // matches the name you set in Shiprocket dashboard
    billing_customer_name: order.customer_name,
    billing_last_name: "",
    billing_address: order.address_line1,
    billing_address_2: order.address_line2 || "",
    billing_city: order.city,
    billing_pincode: order.pincode,
    billing_state: order.state,
    billing_country: order.country || "India",
    billing_email: order.customer_email,
    billing_phone: order.customer_phone,
    shipping_is_billing: true,
    order_items: items.map((item) => ({
      name: item.product_name,
      sku: item.sku_variant,
      units: item.quantity,
      selling_price: item.unit_price,       // your final_price, already discount-applied
    })),
    payment_method: "Prepaid",               // always — no COD supported
    sub_total: order.subtotal,
    length: 20,  // cm — placeholder; replace with real per-product dimensions once you track them
    breadth: 15,
    height: 5,
    weight: 0.5, // kg — same caveat; ideally sum real product weights
  };

  const { data } = await shiprocketApi.post("/orders/create/adhoc", payload);
  return data; // { order_id, shipment_id, status, ... }
}

// ==========================================================
// ASSIGN COURIER (AWB generation) — either pass a specific
// courier_id, or omit it to let Shiprocket auto-assign the
// cheapest serviceable courier.
// ==========================================================
export async function assignCourierAndGenerateAWB(shipmentId, courierId = null) {
  const payload = { shipment_id: shipmentId };
  if (courierId) payload.courier_id = courierId;

  const { data } = await shiprocketApi.post("/courier/assign/awb", payload);
  return data; // { awb_code, courier_name, courier_company_id, ... }
}

// ==========================================================
// GENERATE LABEL
// ==========================================================
export async function generateLabel(shipmentId) {
  const { data } = await shiprocketApi.post("/courier/generate/label", {
    shipment_id: [shipmentId],
  });
  return data; // { label_url }
}

// ==========================================================
// GENERATE INVOICE
// ==========================================================
export async function generateInvoice(orderId) {
  const { data } = await shiprocketApi.post("/orders/print/invoice", {
    ids: [orderId],
  });
  return data; // { invoice_url }
}

// ==========================================================
// GENERATE MANIFEST
// ==========================================================
export async function generateManifest(shipmentId) {
  const { data } = await shiprocketApi.post("/manifests/generate", {
    shipment_id: [shipmentId],
  });
  return data; // { manifest_url }
}

// ==========================================================
// SCHEDULE PICKUP
// ==========================================================
export async function schedulePickup(shipmentId) {
  const { data } = await shiprocketApi.post("/courier/generate/pickup", {
    shipment_id: [shipmentId],
  });
  return data; // { pickup_scheduled_date, pickup_token_number, ... }
}

// ==========================================================
// TRACK SHIPMENT
// ==========================================================
export async function trackShipment(awbCode) {
  const { data } = await shiprocketApi.get(`/courier/track/awb/${awbCode}`);
  return data; // { tracking_data: { shipment_track, shipment_track_activities } }
}

// ==========================================================
// CANCEL SHIPMENT
// ==========================================================
export async function cancel(req, res, next) {
  try {
    const { orderId } = req.params;
    const order = await getOrderById(orderId);
    if (!order?.awb_number) {
      return res.status(400).json({ success: false, message: "No AWB to cancel." });
    }

    const data = await ShiprocketService.cancelShipment(order.awb_number);

    // NEW — this was missing before: reflect the cancellation in your
    // own DB, not just Shiprocket's side.
    await updateShippingStatus(orderId, { shipping_status: "Cancelled" });
    await updateOrderStatus(orderId, "cancelled"); // needs import from orderModel.js

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
// ==========================================================
// CREATE RETURN PICKUP — reverse shipment, customer's address
// becomes the pickup point, your shop becomes the destination.
// ==========================================================
export async function createReturnShipment(order, returnRequest, items, pickupLocationName) {
  const payload = {
    order_id: `RET-${returnRequest.return_id}`,
    order_date: new Date().toISOString().slice(0, 19).replace("T", " "),
    pickup_customer_name: order.customer_name,       // pickup FROM customer
    pickup_address: order.address_line1,
    pickup_city: order.city,
    pickup_pincode: order.pincode,
    pickup_state: order.state,
    pickup_country: order.country || "India",
    pickup_email: order.customer_email,
    pickup_phone: order.customer_phone,
    shipping_customer_name: "Vintage Fashion",         // deliver TO shop
    shipping_address: pickupLocationName,              // your registered shop address
    order_items: items.map((item) => ({
      name: item.product_name,
      sku: item.sku_variant,
      units: item.quantity,
      selling_price: item.unit_price,
    })),
    payment_method: "Prepaid",
    sub_total: order.total_amount,
    length: 20,
    breadth: 15,
    height: 5,
    weight: 0.5,
  };

  const { data } = await shiprocketApi.post("/orders/create/return", payload);
  return data;
}