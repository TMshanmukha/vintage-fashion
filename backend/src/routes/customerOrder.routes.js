import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getMyOrders,
  getMyOrderDetail,
  cancelMyOrder,
  requestReturn,
} from "../controllers/customerOrder.controller.js";

const router = Router();

// Customer only — no authorizeAdmin here, deliberately
router.use(authenticate);

router.get("/my", getMyOrders);
router.get("/my/:orderId", getMyOrderDetail);
router.patch("/my/:orderId/cancel", cancelMyOrder);
router.patch("/my/:orderId/return", requestReturn);

export default router;

// In your main app/router file, mount this alongside your other routes:
// import customerOrderRoutes from "./routes/customerOrder.routes.js";
// app.use("/api/orders", customerOrderRoutes);
//
// This is separate from your admin order routes (mounted at /api/admin/orders
// per your orderApi.js), so there's no path collision.
