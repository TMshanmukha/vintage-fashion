import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeAdmin } from "../middlewares/admin.middleware.js";
import {
    listNotifications,
    markRead,
    markAllRead,
    removeNotification
} from "../controllers/notificationController.js";

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get("/", listNotifications);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markRead);
router.delete("/:id", removeNotification);

export default router;
