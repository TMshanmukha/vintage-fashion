import api from "./AdminApi";
import { cachedAxiosGet, invalidateCache } from "../utils/apiCache";

// GET /api/products?search=&page=&limit=&category=
export const getProducts = async (params = {}) => {
  const res = await cachedAxiosGet(api, "/products", params);
  return res.data; // { success, message, data, pagination }
};

// GET /api/products/:slug
export const getProductBySlug = async (slug) => {
  const res = await cachedAxiosGet(api, `/products/${slug}`);
  return res.data; // { success, message, data }
};

// POST /api/products
export const createProduct = async (payload) => {
  const res = await api.post("/products", payload);
  invalidateCache("products");
  invalidateCache("marketing");
  return res.data; // { success, message, data }
};

// PUT /api/products/:id
export const updateProduct = async (id, payload) => {
  const res = await api.put(`/products/${id}`, payload);
  invalidateCache("products");
  invalidateCache("marketing");
  return res.data; // { success, message, data }
};

// DELETE /api/products/:id
export const deleteProduct = async (id) => {
  const res = await api.delete(`/products/${id}`);
  invalidateCache("products");
  invalidateCache("marketing");
  return res.data; // { success, message }
};

export default api;