import api from "./API";

// GET /api/wishlist
export const getWishlist = async () => {
  const res = await api.get("/wishlist");
  return res.data; // { success, message, data }
};

// POST /api/wishlist
export const addToWishlist = async (productId) => {
  const res = await api.post("/wishlist", { product_id: productId });
  return res.data;
};

// DELETE /api/wishlist/:productId
export const removeFromWishlistApi = async (productId) => {
  const res = await api.delete(`/wishlist/${productId}`);
  return res.data;
};

export default api;
