import API from "./API";
import axiosAdmin from "./AdminApi";

// Public / Customer
export const calculateShippingRate = (payload) =>
  API.post("/shipping/calculate", payload);

export const getShippingSettings = () =>
  API.get("/shipping/settings");

export const checkServiceability = (deliveryPincode) =>
  API.get("/shipping/serviceability", { params: { deliveryPincode } });

export const trackOrder = (orderId) =>
  API.get(`/shipping/track/${orderId}`);

// Admin Settings
export const getAdminShippingSettings = () =>
  axiosAdmin.get("/shipping/admin/settings");

export const updateAdminShippingSettings = (settings) =>
  axiosAdmin.patch("/shipping/admin/settings", settings);

// Admin Order Shipping & Fulfillment
export const updateOrderDeliveryMethod = (orderId, delivery_method) =>
  axiosAdmin.patch(`/admin/orders/${orderId}/delivery-method`, { delivery_method });

export const updateLocalDeliveryStatus = (orderId, action) =>
  axiosAdmin.patch(`/admin/orders/${orderId}/local-delivery-status`, { action });

export const scheduleCourierPickup = (orderId) =>
  axiosAdmin.post(`/shipping/pickup/${orderId}`);

export const getShippingLabel = (orderId) =>
  axiosAdmin.get(`/shipping/label/${orderId}`);

export const getShippingInvoice = (orderId) =>
  axiosAdmin.get(`/shipping/invoice/${orderId}`);

export const getShippingManifest = (orderId) =>
  axiosAdmin.get(`/shipping/manifest/${orderId}`);

