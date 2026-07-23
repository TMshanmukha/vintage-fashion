import * as CustomerOrderService from "../services/customerOrder.service.js";

// GET /api/orders/my
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id; // adjust if your authenticate middleware sets a different key

    const { rows, total } = await CustomerOrderService.listMyOrders(userId, {
      page: Number(page),
      limit: Number(limit),
    });

    res.json({ orders: rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your orders." });
  }
};

// GET /api/orders/my/:orderId
export const getMyOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const result = await CustomerOrderService.getMyOrderDetail(orderId, userId);
    if (!result) return res.status(404).json({ message: "Order not found." });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch order." });
  }
};

// PATCH /api/orders/my/:orderId/cancel
export const cancelMyOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const result = await CustomerOrderService.cancelMyOrder(orderId, userId);

    if (result.error === "NOT_FOUND") {
      return res.status(404).json({ message: "Order not found." });
    }
    if (result.error === "NOT_CANCELLABLE") {
      return res.status(400).json({ message: "This order can no longer be cancelled." });
    }

    res.json({ message: "Order cancelled." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to cancel order." });
  }
};

// PATCH /api/orders/my/:orderId/return
export const requestReturn = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const result = await CustomerOrderService.requestReturn(orderId, userId);

    if (result.error === "NOT_FOUND") {
      return res.status(404).json({ message: "Order not found." });
    }
    if (result.error === "NOT_RETURNABLE") {
      return res.status(400).json({ message: "This order isn't eligible for return." });
    }

    res.json({ message: "Return requested." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to request return." });
  }
};
