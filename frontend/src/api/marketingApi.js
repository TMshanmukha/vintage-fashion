import API from "./API";
import { cachedAxiosGet } from "../utils/apiCache";

export const getSiteSettings = () => cachedAxiosGet(API, "/admin/marketing/settings");
export const getBanners = () => cachedAxiosGet(API, "/admin/marketing/banners");
export const getBannerById = (id) => cachedAxiosGet(API, `/admin/marketing/banners/${id}`);
export const getCards = () => cachedAxiosGet(API, "/admin/marketing/cards");
export const getCardById = (id) => cachedAxiosGet(API, `/admin/marketing/cards/${id}`);
export const getFeaturedProducts = () => cachedAxiosGet(API, "/admin/marketing/featured-products");
export const getFlashSales = () => cachedAxiosGet(API, "/admin/marketing/flash-sales");
export const getFlashSaleById = (id) => cachedAxiosGet(API, `/admin/marketing/flash-sales/${id}`);
export const getSections = () => cachedAxiosGet(API, "/admin/marketing/sections");