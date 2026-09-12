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

export const syncPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const result = await OrderService.syncRazorpayPayment(orderId);
        res.json(result);
    } catch (err) {
        console.error("Sync Payment Status Error:", err);
        res.status(500).json({ success: false, message: err.message || "Failed to sync payment status with Razorpay." });
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
// body: { action } — "approve" | "reject" | "schedule_pickup" | "picked_up" | "received" | "process_refund"
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
        if (result.error === "NO_PAYMENT_ON_RECORD") {
            return res.status(400).json({ message: "No payment record found for this order — can't process a refund." });
        }
        if (result.error === "REFUND_FAILED") {
            return res.status(502).json({ message: "Razorpay couldn't process this refund right now. Please try again." });
        }

        res.json({ message: "Return status updated.", status: result.status });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update return status." });
    }
};

// PATCH /api/orders/:orderId/delivery-method
// body: { delivery_method } — "LOCAL" | "COURIER"
export const changeDeliveryMethod = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { delivery_method } = req.body;

        if (!delivery_method || !["LOCAL", "COURIER"].includes(delivery_method.toUpperCase())) {
            return res.status(400).json({ message: "Invalid delivery method. Allowed: LOCAL, COURIER" });
        }

        const result = await OrderService.changeDeliveryMethod(orderId, delivery_method.toUpperCase());
        if (!result) return res.status(404).json({ message: "Order not found." });

        res.json({ success: true, message: `Delivery method updated to ${delivery_method.toUpperCase()}`, delivery_method: delivery_method.toUpperCase() });
    } catch (err) {
        console.error("Change Delivery Method Error:", err);
        res.status(500).json({ message: err.message || "Failed to update delivery method." });
    }
};

// PATCH /api/orders/:orderId/local-delivery-status
// body: { action } — "ready_for_delivery" | "out_for_delivery" | "delivered"
export const changeLocalDeliveryStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { action } = req.body;

        const result = await OrderService.changeLocalDeliveryStatus(orderId, action);
        if (!result) return res.status(404).json({ message: "Order not found." });

        res.json({ success: true, message: "Local delivery status updated.", ...result });
    } catch (err) {
        console.error("Change Local Delivery Status Error:", err);
        res.status(500).json({ message: err.message || "Failed to update local delivery status." });
    }
};