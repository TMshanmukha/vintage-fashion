import * as OrderService from "../services/orderService.js";

export const listOrders = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;

        const { rows, total } = await OrderService.listOrders({
            status,
            search,
            page: Number(page),
            limit: Number(limit)
        });

        res.json({ orders: rows, total, page: Number(page), limit: Number(limit) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch orders." });
    }
};

export const getOrder = async (req, res) => {
    console.log("===== GET MY ORDERS =====");
    console.log("req.user =", req.user);
    try {
        const { orderId } = req.params;

        const result = await OrderService.getOrderDetail(orderId);
        if (!result) return res.status(404).json({ message: "Order not found." });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch order." });
    }
};

// body: { status }
export const changeOrderStatus = async (req, res) => {

    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const valid = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "return_requested", "returned"];
        if (!valid.includes(status)) {
            return res.status(400).json({ message: "Invalid order status." });
        }

        const order = await OrderService.changeOrderStatus(orderId, status);
        if (!order) return res.status(404).json({ message: "Order not found." });

        res.json({ message: "Order status updated." });
    } catch (error) {

        console.error("Update Order Status Error:", error);

        return res.status(500).json({
            success: false,
            message: "We couldn't update the order status right now. Please try again in a moment."
        });

    }
};

// body: { status } — pending | success | failed | refunded
export const changePaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const valid = ["pending", "success", "failed", "refunded"];
        if (!valid.includes(status)) {
            return res.status(400).json({ message: "Invalid payment status." });
        }

        await OrderService.changePaymentStatus(orderId, status);
        res.json({ message: "Payment status updated." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update payment status." });
    }
};

export const getStats = async (req, res) => {
  try {
    const stats = await OrderService.getStats();
    res.json(stats); // fixed: was res.json({ stats })
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch order stats." });
  }
};