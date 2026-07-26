import * as OrderModel from "../models/orderModel.js";
import * as ReturnModel from "../models/returnModel.js";
import * as NotificationService from "./notificationService.js";
import { getIO } from "../socket/index.js";

const CANCELLABLE_STATUSES = ["pending", "confirmed", "packed"];
const RETURNABLE_STATUSES = ["delivered"];

export const listMyOrders = async (userId, { page, limit }) => {
    return OrderModel.getOrdersByUserId(userId, { page, limit });
};

export const getMyOrderDetail = async (orderId, userId) => {
    const owned = await OrderModel.getOrderOwnedByUser(orderId, userId);
    if (!owned) return null;

    const items = await OrderModel.getOrderItems(orderId);
    const payment = await OrderModel.getOrderPayment(orderId);
    const returnRequest = await ReturnModel.getReturnByOrderId(orderId);

    return { order: owned, items, payment, returnRequest };
};

export const cancelMyOrder = async (orderId, userId) => {
    const order = await OrderModel.getOrderOwnedByUser(orderId, userId);
    if (!order) return { error: "NOT_FOUND" };

    if (!CANCELLABLE_STATUSES.includes(order.order_status)) {
        return { error: "NOT_CANCELLABLE" };
    }

    await OrderModel.updateOrderStatus(orderId, "cancelled");

    await NotificationService.createNotification({
        title: "Order cancelled",
        body: `Order #${orderId} was cancelled by the customer`,
        type: "order",
        referenceId: orderId,
    });

    try {
        getIO().to(`user:${userId}`).emit("order:status-changed", {
            orderId,
            order_status: "cancelled",
        });
    } catch (err) {
        console.warn("Socket emit skipped:", err.message);
    }

    return { success: true };
};

export const requestReturn = async (orderId, userId, { reason, description, photos }) => {
    const order = await OrderModel.getOrderOwnedByUser(orderId, userId);
    if (!order) return { error: "NOT_FOUND" };

    if (!RETURNABLE_STATUSES.includes(order.order_status)) {
        return { error: "NOT_RETURNABLE" };
    }

    const existing = await ReturnModel.getReturnByOrderId(orderId);
    if (existing && existing.status !== "rejected") {
        return { error: "ALREADY_REQUESTED" };
    }

    const returnId = await ReturnModel.createReturn({ orderId, userId, reason, description, photos });

    await NotificationService.createNotification({
        title: "Return requested",
        body: `Customer requested a return for order #${orderId}`,
        type: "order",
        referenceId: orderId,
    });

    return { success: true, returnId };
};

export const getMyReturnStatus = async (orderId, userId) => {
    const order = await OrderModel.getOrderOwnedByUser(orderId, userId);
    if (!order) return { error: "NOT_FOUND" };

    const returnRequest = await ReturnModel.getReturnByOrderId(orderId);
    if (!returnRequest) return { error: "NO_RETURN" };

    return { success: true, returnRequest };
};