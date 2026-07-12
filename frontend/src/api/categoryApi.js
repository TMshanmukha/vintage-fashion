import api from "./auth.api"; // your existing axios instance

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