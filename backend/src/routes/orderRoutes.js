import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeAdmin } from "../middlewares/admin.middleware.js";
import {
    listOrders,
    getOrder,
    changeOrderStatus,
    changePaymentStatus,
    getStats,
    listReturns,
    changeReturnStatus
} from "../controllers/orderController.js";

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get("/stats", getStats);
router.get("/returns", listReturns);
router.patch("/returns/:returnId/status", changeReturnStatus);
router.get("/", listOrders);
router.get("/:orderId", getOrder);
router.patch("/:orderId/status", changeOrderStatus);
router.patch("/:orderId/payment-status", changePaymentStatus);

export default router;