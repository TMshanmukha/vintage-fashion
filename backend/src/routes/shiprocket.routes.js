import { Router } from "express";
import * as ShiprocketController from "../controllers/shiprocket.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeAdmin } from "../middlewares/admin.middleware.js";

const requireAdminAuth = [authenticate, authorizeAdmin];
const requireCustomerAuth = authenticate;

const router = Router();

router.get("/serviceability", requireAdminAuth, ShiprocketController.checkServiceability);
router.get("/couriers", requireAdminAuth, ShiprocketController.getCouriers);

router.post("/create/:orderId", requireAdminAuth, ShiprocketController.createFullShipment);
router.post("/pickup/:orderId", requireAdminAuth, ShiprocketController.schedulePickup);
router.post("/cancel/:orderId", requireAdminAuth, ShiprocketController.cancel);
router.post("/return/:orderId", requireAdminAuth, ShiprocketController.createReturn);

router.get("/track/:orderId", requireCustomerAuth, ShiprocketController.trackByOrderId); // customer + admin both need this
router.get("/label/:orderId", requireAdminAuth, ShiprocketController.getLabel);
router.get("/invoice/:orderId", requireAdminAuth, ShiprocketController.getInvoice);
router.get("/manifest/:orderId", requireAdminAuth, ShiprocketController.getManifest);

export default router;