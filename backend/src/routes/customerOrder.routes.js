import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getMyOrders,
  getMyOrderDetail,
  cancelMyOrder,
  requestReturn,
  getMyReturn,
  trackMyOrder
} from "../controllers/customerOrder.controller.js";

import { uploadReturnPhotos } from "../middlewares/uploadreturnphotos.middleware.js";
// ...


const router = Router();

// Customer only — no authorizeAdmin here, deliberately
router.use(authenticate);

router.get("/my", getMyOrders);
router.get("/my/:orderId", getMyOrderDetail);
router.patch("/my/:orderId/cancel", cancelMyOrder);
router.get("/my/:orderId/track", trackMyOrder);

router.get("/my/:orderId/return", getMyReturn);
router.patch("/my/:orderId/return", uploadReturnPhotos.array("photos", 4), requestReturn);


export default router;

// In your main app/router file, mount this alongside your other routes:
// import customerOrderRoutes from "./routes/customerOrder.routes.js";
// app.use("/api/orders", customerOrderRoutes);
//
// This is separate from your admin order routes (mounted at /api/admin/orders
// per your orderApi.js), so there's no path collision.
