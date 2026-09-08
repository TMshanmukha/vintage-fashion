import API from "./API";

export const checkServiceability = (deliveryPincode) =>
  API.get("/shipping/serviceability", { params: { deliveryPincode } });

export const trackOrder = (orderId) =>
  API.get(`/shipping/track/${orderId}`);
