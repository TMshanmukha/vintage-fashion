import api from "./AdminApi";
import { cachedAxiosGet, invalidateCache } from "../utils/apiCache";

export const getBrands = async (params = {}) => {
  const res = await cachedAxiosGet(api, "/brands", params);
  return res.data;
};

export const getBrandBySlug = async (slug) => {
  const res = await cachedAxiosGet(api, `/brands/${slug}`);
  return res.data;
};

export const createBrand = async (formData) => {
  const res = await api.post("/brands", formData);
  invalidateCache("brands");
  return res.data;
};

export const updateBrand = async (id, formData) => {
  const res = await api.put(`/brands/${id}`, formData);
  invalidateCache("brands");
  return res.data;
};

export const deleteBrand = async (id) => {
  const res = await api.delete(`/brands/${id}`);
  invalidateCache("brands");
  return res.data;
};

export default api;