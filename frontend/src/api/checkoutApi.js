import api from "./API";

// POST /api/checkout/initiate
export const initiateCheckout = async (addressId) => {
  const res = await api.post("/checkout/initiate", { address_id: addressId });
  return res.data;
};

// POST /api/checkout/verify
export const verifyPayment = async (payload) => {
  const res = await api.post("/checkout/verify", payload);
  return res.data;
};

export default api;
