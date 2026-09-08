import api from "./AdminApi";
import { cachedAxiosGet, invalidateCache } from "../utils/apiCache";

export const createCategory = async (categoryData) => {
    const response = await api.post(
        "/categories",
        categoryData,
        {
            withCredentials: true,
        }
    );
    invalidateCache("categories");
    return response.data;
};

export const getCategories = async (params = {}) => {
    const response = await cachedAxiosGet(
        api,
        "/categories",
        params
    );
    return response.data;
};

export const restoreCategory = async (id) => {
    const response = await api.patch(
        `/categories/${id}/restore`
    );
    invalidateCache("categories");
    return response.data;
};

// GET /api/categories
// Public endpoint — returns active categories cached in browser memory/session
export const getCategoriesUser = async () => {
    const response = await cachedAxiosGet(api, "/categories");
    return response.data; // { success, message, data }
};

export default api;