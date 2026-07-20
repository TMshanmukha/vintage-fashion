import * as OrderModel from "../models/orderModel.js";
import * as NotificationService from "./notificationService.js";

export const listOrders = async ({ status, search, page, limit }) => {
    return OrderModel.getAllOrders({ status, search, page, limit });
};

export const getOrderDetail = async (orderId) => {
    const order = await OrderModel.getOrderById(orderId);
    if (!order) return null;

    const items = await OrderModel.getOrderItems(orderId);
    const payment = await OrderModel.getOrderPayment(orderId);

    return { order, items, payment };
};

export const changeOrderStatus = async (orderId, status) => {
    const order = await OrderModel.getOrderById(orderId);
    if (!order) return null;

    await OrderModel.updateOrderStatus(orderId, status);

    await NotificationService.createNotification({
        title: "Order status updated",
        body: `Order #${order.order_number} is now ${status}`,
        type: "order",
        referenceId: orderId
    });

    return order;
};

export const changePaymentStatus = async (orderId, status) => {
    return OrderModel.updatePaymentStatus(orderId, status);
};

export const getStats = async () => {
    return OrderModel.getOrderStats();
};
