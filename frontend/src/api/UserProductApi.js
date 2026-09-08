import API from "./API";
import { cachedAxiosGet } from "../utils/apiCache";

export const getProducts = (params = {}) => cachedAxiosGet(API, "/products", params);
export const getProductBySlug = (slug) => cachedAxiosGet(API, `/products/${slug}`);