import API from "./API";
import AdminApi from "./AdminApi";

// Customer / Public Reviews API
export const getProductReviews = async (productId) => {
  const { data } = await API.get(`/reviews/product/${productId}`);
  return data;
};

export const submitProductReview = async (productId, reviewData) => {
  const { data } = await API.post(`/reviews/product/${productId}`, reviewData);
  return data;
};

// Admin Reviews API
export const getAdminReviews = async (params = {}) => {
  try {
    const { data } = await AdminApi.get("/admin/reviews", { params });
    return data;
  } catch (err) {
    if (err.response?.status === 404) {
      const { data } = await AdminApi.get("/reviews/admin/all", { params });
      return data;
    }
    throw err;
  }
};

export const deleteAdminReview = async (reviewId) => {
  try {
    const { data } = await AdminApi.delete(`/admin/reviews/${reviewId}`);
    return data;
  } catch (err) {
    if (err.response?.status === 404) {
      const { data } = await AdminApi.delete(`/reviews/admin/${reviewId}`);
      return data;
    }
    throw err;
  }
};
