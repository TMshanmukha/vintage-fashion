import { Router } from "express";
import * as ShippingController from "../controllers/shipping.controller.js";
import * as ShiprocketController from "../controllers/shiprocket.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeAdmin } from "../middlewares/admin.middleware.js";

const requireAdminAuth = [authenticate, authorizeAdmin];
const requireCustomerAuth = authenticate;

const router = Router();

// 1. Rate Calculation (supports logged in users or guests with pincode/address_id)
router.post("/calculate", (req, res, next) => {
    if (req.headers.authorization || req.cookies?.token) {
        authenticate(req, res, next);
    } else {
        next();
    }
}, ShippingController.calculateShipping);

// 2. Settings
router.get("/settings", ShippingController.getPublicShippingSettings);
router.get("/admin/settings", requireAdminAuth, ShippingController.getAdminShippingSettings);
router.patch("/admin/settings", requireAdminAuth, ShippingController.updateAdminShippingSettings);

// 3. Shiprocket Fulfillment & Tracking (Admin & Customer)
router.get("/serviceability", requireAdminAuth, ShiprocketController.checkServiceability);
router.get("/couriers", requireAdminAuth, ShiprocketController.getCouriers);

router.post("/create/:orderId", requireAdminAuth, ShiprocketController.createFullShipment);
router.post("/pickup/:orderId", requireAdminAuth, ShiprocketController.schedulePickup);
router.post("/cancel/:orderId", requireAdminAuth, ShiprocketController.cancel);
router.post("/return/:orderId", requireAdminAuth, ShiprocketController.createReturn);

router.get("/track/:orderId", requireCustomerAuth, ShiprocketController.trackByOrderId);
router.get("/label/:orderId", requireAdminAuth, ShiprocketController.getLabel);
router.get("/invoice/:orderId", requireAdminAuth, ShiprocketController.getInvoice);
router.get("/manifest/:orderId", requireAdminAuth, ShiprocketController.getManifest);

export default router;
