import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeAdmin } from "../middlewares/admin.middleware.js";

import {
    listCustomers,
    toggleStatus,
    removeCustomer
} from "../controllers/adminUserController.js";

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get("/", listCustomers);
router.patch("/:userId/status", toggleStatus);
router.delete("/:userId", removeCustomer);

export default router;
