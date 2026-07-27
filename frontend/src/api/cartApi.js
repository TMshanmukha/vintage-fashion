import api from "./API";

// GET /api/cart
export const getCart = async () => {
  const res = await api.get("/cart");
  return res.data; // { success, message, data }
};

// POST /api/cart
export const addToCartApi = async (variantId, quantity = 1) => {
  const res = await api.post("/cart", { variant_id: variantId, quantity });
  return res.data;
};

// PATCH /api/cart/:cartItemId
export const updateCartItemApi = async (cartItemId, quantity) => {
  const res = await api.patch(`/cart/${cartItemId}`, { quantity });
  return res.data;
};

// DELETE /api/cart/:cartItemId
export const removeCartItemApi = async (cartItemId) => {
  const res = await api.delete(`/cart/${cartItemId}`);
  return res.data;
};

export default api;
