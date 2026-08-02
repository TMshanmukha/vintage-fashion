import API from "./API";

export const getSiteSettings = () => API.get("/admin/marketing/settings");
export const getBanners = () => API.get("/admin/marketing/banners");
export const getBannerById = (id) => API.get(`/admin/marketing/banners/${id}`);
export const getCards = () => API.get("/admin/marketing/cards");
export const getCardById = (id) => API.get(`/admin/marketing/cards/${id}`);
export const getFeaturedProducts = () => API.get("/admin/marketing/featured-products");
export const getFlashSales = () => API.get("/admin/marketing/flash-sales");
export const getFlashSaleById = (id) => API.get(`/admin/marketing/flash-sales/${id}`);
export const getSections = () => API.get("/admin/marketing/sections");