import axiosAdmin from "./axiosAdmin";

export const getOrders = async (params = {}) => {
    const { data } = await axiosAdmin.get("/admin/orders", { params });
    return data; // { orders, total, page, limit }
};

export const getOrderById = async (orderId) => {
    const { data } = await axiosAdmin.get(`/admin/orders/${orderId}`);
    return data; // { order, items, payment }
};

export const updateOrderStatus = async (orderId, status) => {
    const { data } = await axiosAdmin.patch(`/admin/orders/${orderId}/status`, { status });
    return data;
};

export const updatePaymentStatus = async (orderId, status) => {
    const { data } = await axiosAdmin.patch(`/admin/orders/${orderId}/payment-status`, { status });
    return data;
};

export const getOrderStats = async () => {
    const { data } = await axiosAdmin.get("/admin/orders/stats");
    return data.stats;
};
