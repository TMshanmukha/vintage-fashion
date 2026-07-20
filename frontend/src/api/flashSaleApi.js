import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true
});

export const getFlashSales = () => API.get("/admin/marketing/flash-sales");

export const getFlashSale = (id) =>
  API.get(`/admin/marketing/flash-sales/${id}`);

export const createFlashSale = (formData) =>
  API.post("/admin/marketing/flash-sales", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateFlashSale = (id, formData) =>
  API.patch(`/admin/marketing/flash-sales/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteFlashSale = (id) =>
  API.delete(`/admin/marketing/flash-sales/${id}`);

export const setFlashSaleProducts = (id, productIds) =>
  API.put(`/admin/marketing/flash-sales/${id}/products`, {
    product_ids: productIds,
  });
