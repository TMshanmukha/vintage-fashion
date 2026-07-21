import API from "./AdminApi";

export const getBanners = () => API.get("/admin/marketing/banners");

export const getBanner = (id) =>
  API.get(`/admin/marketing/banners/${id}`);

export const createBanner = (formData) =>
  API.post("/admin/marketing/banners", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateBanner = (id, formData) =>
  API.patch(`/admin/marketing/banners/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteBanner = (id) =>
  API.delete(`/admin/marketing/banners/${id}`);

export default API;
