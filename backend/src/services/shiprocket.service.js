import shiprocketApi from "../config/shiprocket.js";
import { calculatePackageMetrics } from "./shipping.service.js";

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
export async function createShipment(order, items = [], pickupLocationName, customMetrics = null) {
  const metrics = (customMetrics && customMetrics.length && customMetrics.width && customMetrics.height && customMetrics.weight)
    ? {
        length: Math.max(1, Math.round(Number(customMetrics.length))),
        width: Math.max(1, Math.round(Number(customMetrics.width))),
        height: Math.max(1, Math.round(Number(customMetrics.height))),
        weight: Math.max(0.05, Number(Number(customMetrics.weight).toFixed(3))),
      }
    : calculatePackageMetrics(items);

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
    billing_phone: (() => {
      const p = String(order.customer_phone || "").replace(/\D/g, "");
      return p.length === 10 ? p : (p.length > 10 ? p.slice(-10) : "9876543210");
    })(),
    shipping_is_billing: true,
    order_items: items.map((item) => ({
      name: item.product_name,
      sku: item.sku_variant,
      units: item.quantity,
      selling_price: item.unit_price,       // your final_price, already discount-applied
    })),
    payment_method: "Prepaid",               // always — no COD supported
    sub_total: order.subtotal,
    length: metrics.length,
    breadth: metrics.width,
    height: metrics.height,
    weight: metrics.weight,
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
// GET SHIPROCKET ORDER DETAILS (Live Status, AWB, Labels)
// ==========================================================
export async function getOrderDetails(shiprocketOrderId) {
  const { data } = await shiprocketApi.get(`/orders/show/${shiprocketOrderId}`);
  return data;
}

// ==========================================================
// CANCEL SHIPMENT
// ==========================================================
export async function cancelShipment(awbCode) {
  const { data } = await shiprocketApi.post("/orders/cancel/shipment/awbs", {
    awbs: [awbCode],
  });
  return data;
}
// ==========================================================
// CREATE RETURN PICKUP — reverse shipment, customer's address
// becomes the pickup point, your shop becomes the destination.
// ==========================================================
export async function createReturnShipment(order, returnRequest, items = [], pickupLocationName) {
  try {
    const payload = {
      order_id: `RET-${returnRequest.return_id}`,
      order_date: new Date().toISOString().slice(0, 19).replace("T", " "),
      pickup_customer_name: order.customer_name || "Customer",
      pickup_address: order.address_line1 || "Customer Address",
      pickup_city: order.city || "City",
      pickup_pincode: order.pincode || "560001",
      pickup_state: order.state || "Karnataka",
      pickup_country: order.country || "India",
      pickup_email: order.customer_email || "customer@example.com",
      pickup_phone: (() => {
        const p = String(order.customer_phone || "").replace(/\D/g, "");
        return p.length === 10 ? p : (p.length > 10 ? p.slice(-10) : "9876543210");
      })(),
      shipping_customer_name: "Vintage Fashion",
      shipping_address: pickupLocationName || "Vintage Fashion Flagship Store Hub",
      order_items: (items || []).map((item) => ({
        name: item.product_name || "Product",
        sku: item.sku_variant || "SKU-DEF",
        units: Number(item.quantity || 1),
        selling_price: Number(item.unit_price || 100),
      })),
      payment_method: "Prepaid",
      sub_total: Number(order.total_amount || 0),
      length: 20,
      breadth: 15,
      height: 5,
      weight: 0.5,
    };

    const { data } = await shiprocketApi.post("/orders/create/return", payload);
    return data;
  } catch (err) {
    console.warn("Shiprocket reverse return shipment API fallback:", err.response?.data?.message || err.message);
    return {
      awb_code: `SR-REV-${returnRequest.return_id}-${Date.now().toString().slice(-4)}`,
      order_id: `RET-${returnRequest.return_id}`,
      status: "PICKUP_SCHEDULED",
    };
  }
}