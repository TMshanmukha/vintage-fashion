import * as OrderModel from "../models/orderModel.js";
import * as NotificationService from "./notificationService.js";

const CANCELLABLE_STATUSES = ["pending", "confirmed", "processing"];
const RETURNABLE_STATUSES = ["delivered"];

export const listMyOrders = async (userId, { page, limit }) => {
  console.log(typeof (userId));
  return OrderModel.getOrdersByUserId(userId, { page, limit });
};

export const getMyOrderDetail = async (orderId, userId) => {
  const owned = await OrderModel.getOrderOwnedByUser(orderId, userId);
  if (!owned) return null;

  const items = await OrderModel.getOrderItems(orderId);
  const payment = await OrderModel.getOrderPayment(orderId);

  return { order: owned, items, payment };
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

  return { success: true };
};

export const requestReturn = async (orderId, userId) => {
  const order = await OrderModel.getOrderOwnedByUser(orderId, userId);
  if (!order) return { error: "NOT_FOUND" };

  if (!RETURNABLE_STATUSES.includes(order.order_status)) {
    return { error: "NOT_RETURNABLE" };
  }

  // NOTE: your schema's order_status enum has no distinct "return requested"
  // state — this sets it straight to "returned". If you want a pending-review
  // step before it's marked returned, that needs a small schema addition
  // (e.g. a return_requests table) — happy to sketch that out if you want it.
  await OrderModel.updateOrderStatus(orderId, "returned");

  await NotificationService.createNotification({
    title: "Return requested",
    body: `Customer requested a return for order #${orderId}`,
    type: "order",
    referenceId: orderId,
  });

  return { success: true };
};
