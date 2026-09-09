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
  const { data } = await AdminApi.get("/reviews/admin/all", { params });
  return data;
};

export const deleteAdminReview = async (reviewId) => {
  const { data } = await AdminApi.delete(`/reviews/admin/${reviewId}`);
  return data;
};
