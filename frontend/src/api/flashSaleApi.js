import API from "./AdminApi";
import { cachedAxiosGet, invalidateCache } from "../utils/apiCache";

export const getFlashSales = () => cachedAxiosGet(API, "/admin/marketing/flash-sales");

export const getFlashSale = (id) =>
  cachedAxiosGet(API, `/admin/marketing/flash-sales/${id}`);

export const createFlashSale = async (formData) => {
  const res = await API.post("/admin/marketing/flash-sales", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  invalidateCache("flash-sales");
  invalidateCache("marketing");
  return res;
};

export const updateFlashSale = async (id, formData) => {
  const res = await API.patch(`/admin/marketing/flash-sales/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  invalidateCache("flash-sales");
  invalidateCache("marketing");
  return res;
};

export const deleteFlashSale = async (id) => {
  const res = await API.delete(`/admin/marketing/flash-sales/${id}`);
  invalidateCache("flash-sales");
  invalidateCache("marketing");
  return res;
};

export const setFlashSaleProducts = async (id, productIds) => {
  const res = await API.put(`/admin/marketing/flash-sales/${id}/products`, {
    product_ids: productIds,
  });
  invalidateCache("flash-sales");
  invalidateCache("marketing");
  return res;
};
