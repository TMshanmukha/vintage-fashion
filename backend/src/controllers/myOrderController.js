import * as OrderModel from "../models/orderModel.js";
import * as NotificationService from "../services/notificationService.js";

const CANCELLABLE = ["pending", "confirmed", "processing"];
const RETURNABLE = ["delivered"];

export const cancelMyOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId; // adjust to your auth payload shape

    const order = await OrderModel.getOrderByIdForUser(orderId, userId);
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (!CANCELLABLE.includes(order.order_status)) {
      return res.status(400).json({
        message: `Order can't be cancelled once it's ${order.order_status}.`,
      });
    }

    await OrderModel.setOrderStatusForUser(orderId, userId, "cancelled");

    await NotificationService.createNotification({
      title: "Order cancelled",
      body: `Order #${order.order_number} was cancelled by the customer.`,
      type: "order",
      referenceId: orderId,
    });

    res.json({ message: "Order cancelled.", order_status: "cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to cancel order." });
  }
};

export const requestMyReturn = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    const order = await OrderModel.getOrderByIdForUser(orderId, userId);
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (!RETURNABLE.includes(order.order_status)) {
      return res.status(400).json({
        message: "Only delivered orders are eligible for return.",
      });
    }

    // NOTE: goes to return_requested, not returned — admin approves/rejects
    await OrderModel.setOrderStatusForUser(orderId, userId, "return_requested");

    await NotificationService.createNotification({
      title: "Return requested",
      body: `Customer requested a return for order #${order.order_number}.`,
      type: "order",
      referenceId: orderId,
    });

    res.json({ message: "Return requested.", order_status: "return_requested" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to request return." });
  }
};