import * as CustomerOrderService from "../services/customerOrder.service.js";

// GET /api/orders/my
export const getMyOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const userId = req.user.userId;

        const { rows, total } = await CustomerOrderService.listMyOrders(userId, {
            page: Number(page),
            limit: Number(limit),
        });

        res.json({
            orders: rows,
            total,
            page: Number(page),
            limit: Number(limit),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch your orders." });
    }
};

// GET /api/orders/my/:orderId
export const getMyOrderDetail = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.userId;

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
        const userId = req.user.userId;

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
// multipart/form-data: reason, description?, photos? (up to 4 image files)
export const requestReturn = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.userId;
        const { reason, description } = req.body;

        if (!reason || !reason.trim()) {
            return res.status(400).json({ message: "Please select a reason for the return." });
        }

        // req.files comes from uploadReturnPhotos.array("photos", 4) on the route —
        // .path on each file is the Cloudinary secure URL, same as avatarUrl elsewhere.
        const photos = (req.files || []).map((file) => file.path);

        const result = await CustomerOrderService.requestReturn(orderId, userId, { reason, description, photos });

        if (result.error === "NOT_FOUND") {
            return res.status(404).json({ message: "Order not found." });
        }
        if (result.error === "NOT_RETURNABLE") {
            return res.status(400).json({ message: "This order isn't eligible for return." });
        }
        if (result.error === "ALREADY_REQUESTED") {
            return res.status(400).json({ message: "A return has already been requested for this order." });
        }

        res.json({ message: "Return requested.", returnId: result.returnId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to request return." });
    }
};

// GET /api/orders/my/:orderId/return
export const getMyReturn = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.userId;

        const result = await CustomerOrderService.getMyReturnStatus(orderId, userId);

        if (result.error === "NOT_FOUND") {
            return res.status(404).json({ message: "Order not found." });
        }
        if (result.error === "NO_RETURN") {
            return res.status(404).json({ message: "No return request found for this order." });
        }

        res.json({ returnRequest: result.returnRequest });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch return status." });
    }
};