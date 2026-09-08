import API from "./AdminApi";
import { cachedAxiosGet, invalidateCache } from "../utils/apiCache";

export const getFeaturedProducts = () =>
  cachedAxiosGet(API, "/admin/marketing/featured-products");

// productIds: number[]  -> replaces the whole featured list
export const setFeaturedProducts = async (productIds) => {
  const res = await API.put("/admin/marketing/featured-products", {
    product_ids: productIds,
  });
  invalidateCache("featured-products");
  invalidateCache("marketing");
  return res;
};

export const removeFeaturedProduct = async (featuredId) => {
  const res = await API.delete(`/admin/marketing/featured-products/${featuredId}`);
  invalidateCache("featured-products");
  invalidateCache("marketing");
  return res;
};
