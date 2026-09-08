import axiosAdmin from "./AdminApi";

export const getOrders = async (params = {}) => {
    const { data } = await axiosAdmin.get("/admin/orders", { params });
    return data.data || data; // { orders, total, page, limit }
};

export const getOrderById = async (orderId) => {
    const { data } = await axiosAdmin.get(`/admin/orders/${orderId}`);
    return data.data || data; // { order, items, payment }
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
    return data.data || data;
};

// --- Returns ---

export const getReturns = async (params = {}) => {
    const { data } = await axiosAdmin.get("/admin/orders/returns", { params });
    return data.data || data; // { returns, total, page, limit }
};

// action: "approve" | "reject" | "picked_up" | "received" | "refunded"
export const updateReturnStatus = async (returnId, action) => {
    const { data } = await axiosAdmin.patch(`/admin/orders/returns/${returnId}/status`, { action });
    return data;
};

export const confirmOrder = async (orderId) => {
    const { data } = await axiosAdmin.patch(`/admin/orders/${orderId}/status`, { status: "confirmed" });
    return data;
};

export const createShipment = async (orderId) => {
    const { data } = await axiosAdmin.post(`/shipping/create/${orderId}`);
    return data;
};

export const trackShipment = async (orderId) => {
    const { data } = await axiosAdmin.get(`/shipping/track/${orderId}`);
    return data;
};

export const cancelOrder = async (orderId) => {
    const { data } = await axiosAdmin.patch(`/admin/orders/${orderId}/status`, { status: "cancelled" });
    return data;
};

export const cancelShipment = async (orderId) => {
    const { data } = await axiosAdmin.post(`/shipping/cancel/${orderId}`);
    return data;
};