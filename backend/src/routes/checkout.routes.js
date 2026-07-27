import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { initiateCheckout, verifyPayment } from "../controllers/checkout.controller.js";

const router = Router();

router.use(authenticate);

router.post("/initiate", initiateCheckout);
router.post("/verify", verifyPayment);

export default router;

// app.use("/api/checkout", checkoutRoutes);
