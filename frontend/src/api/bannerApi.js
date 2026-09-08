import API from "./AdminApi";
import { cachedAxiosGet, invalidateCache } from "../utils/apiCache";

export const getBanners = () => cachedAxiosGet(API, "/admin/marketing/banners");

export const getBanner = (id) =>
  cachedAxiosGet(API, `/admin/marketing/banners/${id}`);

export const createBanner = async (formData) => {
  const res = await API.post("/admin/marketing/banners", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  invalidateCache("banners");
  invalidateCache("marketing");
  return res;
};

export const updateBanner = async (id, formData) => {
  const res = await API.patch(`/admin/marketing/banners/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  invalidateCache("banners");
  invalidateCache("marketing");
  return res;
};

export const deleteBanner = async (id) => {
  const res = await API.delete(`/admin/marketing/banners/${id}`);
  invalidateCache("banners");
  invalidateCache("marketing");
  return res;
};

export const setBannerProducts = async (bannerId, productIds) => {
  const res = await API.put(`/admin/marketing/banners/${bannerId}/products`, { product_ids: productIds });
  invalidateCache("banners");
  invalidateCache("marketing");
  return res;
};

export default API;
