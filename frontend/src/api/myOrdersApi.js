import API from "./API";

export const getMyOrders = async (params = {}) => {
  const { data } = await API.get("/orders/my", { params });
  return data; // { orders, total, page, limit }
};

export const getMyOrderDetail = async (orderId) => {
  const { data } = await API.get(`/orders/my/${orderId}`);
  return data; // { order, items, payment }
};

export const cancelMyOrder = async (orderId) => {
  const { data } = await API.patch(`/orders/my/${orderId}/cancel`);
  return data;
};

export const requestReturn = async (orderId) => {
  const { data } = await API.patch(`/orders/my/${orderId}/return`);
  return data;
};
