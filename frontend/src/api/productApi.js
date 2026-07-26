import api from "./AdminApi";

// GET /api/products?search=&page=&limit=&category=
export const getProducts = async (params = {}) => {
  const res = await api.get("/products", { params });
  console.log(res.data);
  return res.data; // { success, message, data, pagination }
};

// GET /api/products/:slug
export const getProductBySlug = async (slug) => {
  const res = await api.get(`/products/${slug}`);
  return res.data; // { success, message, data }
};

// POST /api/products
export const createProduct = async (payload) => {
  const res = await api.post("/products", payload);
  return res.data; // { success, message, data }
};

// PUT /api/products/:id
export const updateProduct = async (id, payload) => {
  const res = await api.put(`/products/${id}`, payload);
  return res.data; // { success, message, data }
};

// DELETE /api/products/:id
export const deleteProduct = async (id) => {
  const res = await api.delete(`/products/${id}`);
  return res.data; // { success, message }
};

export default api;