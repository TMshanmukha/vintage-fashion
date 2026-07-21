import api from "./AdminApi";


export const getBrands = async (params = {}) => {
  const res = await api.get("/brands", { params });
  return res.data;
};

export const getBrandBySlug = async (slug) => {
  const res = await api.get(`/brands/${slug}`);
  return res.data;
};

export const createBrand = async (formData) => {
  const res = await api.post("/brands", formData);
  return res.data;
};

export const updateBrand = async (id, formData) => {
  const res = await api.put(`/brands/${id}`, formData);
  return res.data;
};

export const deleteBrand = async (id) => {
  const res = await api.delete(`/brands/${id}`);
  return res.data;
};

export default api;