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

        const valid = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"];
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
        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch order stats." });
    }
};

// --- Returns ---

// GET /admin/returns
export const listReturns = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const { rows, total } = await OrderService.listReturns({
            status,
            page: Number(page),
            limit: Number(limit),
        });

        res.json({ returns: rows, total, page: Number(page), limit: Number(limit) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch returns." });
    }
};

// PATCH /admin/returns/:returnId/status
// body: { action } — "approve" | "reject" | "picked_up" | "received" | "refunded"
export const changeReturnStatus = async (req, res) => {
    try {
        const { returnId } = req.params;
        const { action } = req.body;

        const result = await OrderService.changeReturnStatus(returnId, action);

        if (result.error === "NOT_FOUND") {
            return res.status(404).json({ message: "Return request not found." });
        }
        if (result.error === "INVALID_ACTION") {
            return res.status(400).json({ message: "Invalid return action." });
        }

        res.json({ message: "Return status updated.", status: result.status });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update return status." });
    }
};