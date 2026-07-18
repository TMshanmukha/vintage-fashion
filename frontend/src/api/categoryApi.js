import axios from "axios";
import { attachAuthInterceptors } from "../utils/authInterceptor";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true
});

attachAuthInterceptors(api);
export const createCategory = async (categoryData) => {
    const response = await api.post(
        "/admin/categories",
        categoryData,
        {
            withCredentials: true,
        }
    );

    return response.data;
};

export const getCategories = async () => {
    const response = await api.get(
        "/admin/categories",
        {
            withCredentials: true,
        }
    );

    return response.data;
};

export const restoreCategory = async (id) => {

    const response = await api.patch(
        `/categories/${id}/restore`
    );

    return response.data;

};

export default api;