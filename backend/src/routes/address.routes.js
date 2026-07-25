import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { listAddresses, addAddress } from "../controllers/address.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", listAddresses);
router.post("/", addAddress);

export default router;

// app.use("/api/addresses", addressRoutes);
