import API from "./Api";

export const getProducts = (params = {}) => API.get("/products", { params });
export const getProductBySlug = (slug) => API.get(`/products/${slug}`);