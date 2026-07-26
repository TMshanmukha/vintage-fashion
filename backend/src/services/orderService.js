import * as OrderModel from "../models/orderModel.js";
import * as ReturnModel from "../models/returnModel.js";
import * as NotificationService from "./notificationService.js";
import * as CourierService from "./courierService.js";
import { getIO } from "../socket/index.js";

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

// Central place order status changes flow through — this is where the
// courier gets triggered and the customer's own tab gets pushed the
// update live, in addition to the existing notification.
export const changeOrderStatus = async (orderId, status) => {
    const order = await OrderModel.getOrderById(orderId);
    if (!order) return null;

    // The moment an order is confirmed, the shipment is created on the
    // courier's side. Everything from here on (packed/shipped/delivered)
    // is just status bookkeeping — no further courier calls needed until
    // you wire in real tracking refresh via trackShipment().
    if (status === "confirmed" && order.order_status === "pending") {
        const shipment = await CourierService.createShipment(order);
        await OrderModel.updateShipmentInfo(orderId, shipment);
    }

    await OrderModel.updateOrderStatus(orderId, status);

    await NotificationService.createNotification({
        title: "Order status updated",
        body: `Order #${order.order_number} is now ${status}`,
        type: "order",
        referenceId: orderId
    });

    try {
        getIO().to(`user:${order.user_id}`).emit("order:status-changed", {
            orderId,
            order_status: status,
        });
    } catch (err) {
        console.warn("Socket emit skipped:", err.message);
    }

    return order;
};

export const changePaymentStatus = async (orderId, status) => {
    return OrderModel.updatePaymentStatus(orderId, status);
};

export const getStats = async () => {
    return OrderModel.getOrderStats();
};

// --- Returns management ---

export const listReturns = async ({ status, page, limit }) => {
    return ReturnModel.getAllReturns({ status, page, limit });
};

// action: "approve" | "reject" | "received" | "refunded"
export const changeReturnStatus = async (returnId, action) => {
    const returnRequest = await ReturnModel.getReturnById(returnId);
    if (!returnRequest) return { error: "NOT_FOUND" };

    let nextStatus;
    let pickupTrackingId = null;

    switch (action) {
        case "approve": {
            nextStatus = "pickup_scheduled";
            const pickup = await CourierService.scheduleReturnPickup(returnRequest);
            pickupTrackingId = pickup.pickupTrackingId;
            break;
        }
        case "reject":
            nextStatus = "rejected";
            break;
        case "picked_up":
            nextStatus = "picked_up";
            break;
        case "received":
            nextStatus = "received";
            break;
        case "refunded":
            nextStatus = "refunded";
            break;
        default:
            return { error: "INVALID_ACTION" };
    }

    await ReturnModel.updateReturnStatus(returnId, nextStatus, pickupTrackingId);

    await NotificationService.createNotification({
        title: "Return status updated",
        body: `Return #${returnId} is now ${nextStatus.replace("_", " ")}`,
        type: "order",
        referenceId: returnRequest.order_id,
    });

    try {
        getIO().to(`user:${returnRequest.user_id}`).emit("return:status-changed", {
            returnId,
            status: nextStatus,
        });
    } catch (err) {
        console.warn("Socket emit skipped:", err.message);
    }

    return { success: true, status: nextStatus };
};