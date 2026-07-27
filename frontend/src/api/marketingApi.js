import API from "./API";

// These live under /api/admin/marketing on the backend but the GET routes
// currently have no auth middleware, so the public storefront can read them.
// See note above re: locking down the mutation routes.

export const getSiteSettings = () => API.get("/admin/marketing/settings");
export const getBanners = () => API.get("/admin/marketing/banners");
export const getCards = () => API.get("/admin/marketing/cards");
export const getFeaturedProducts = () => API.get("/admin/marketing/featured-products");
export const getFlashSales = () => API.get("/admin/marketing/flash-sales");
export const getSections = () => API.get("/admin/marketing/sections");
