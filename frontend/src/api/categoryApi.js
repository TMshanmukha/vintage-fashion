import api from "./AdminApi";

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

// GET /api/categories
// Public endpoint — no auth required. Returns all active categories.
export const getCategoriesUser = async () => {
  const response = await api.get("/categories");
  return response.data; // { success, message, data }
};


export default api;