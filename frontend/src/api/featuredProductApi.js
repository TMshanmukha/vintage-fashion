import API from "./AdminApi";

export const getFeaturedProducts = () =>
  API.get("/admin/marketing/featured-products");

// productIds: number[]  -> replaces the whole featured list
export const setFeaturedProducts = (productIds) =>
  API.put("/admin/marketing/featured-products", {
    product_ids: productIds,
  });

export const removeFeaturedProduct = (featuredId) =>
  API.delete(`/admin/marketing/featured-products/${featuredId}`);
