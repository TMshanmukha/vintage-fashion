import API from "./API";

export const getMyOrders = async (params = {}) => {
  const { data } = await API.get("/orders/my", { params });
  return data;
};

export const getMyOrderDetail = async (orderId) => {
  const { data } = await API.get(`/orders/my/${orderId}`);
  return data;
};

export const cancelMyOrder = async (orderId) => {
  const { data } = await API.patch(`/orders/my/${orderId}/cancel`);
  return data;
};

// photos is an array of File objects from an <input type="file"> — sent
// as multipart/form-data so Multer + Cloudinary on the backend can pick
// them up, same pattern as your avatar upload.
export const requestReturn = async (orderId, { reason, description, photos }) => {
  const formData = new FormData();
  formData.append("reason", reason);
  if (description) formData.append("description", description);
  (photos || []).forEach((file) => formData.append("photos", file));

  const { data } = await API.patch(`/orders/my/${orderId}/return`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const getMyReturn = async (orderId) => {
  const { data } = await API.get(`/orders/my/${orderId}/return`);
  return data;
};

export const trackMyOrder = async (orderId) => {
  const { data } = await API.get(`/orders/my/${orderId}/track`);
  return data;
};
