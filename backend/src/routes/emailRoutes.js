import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeAdmin } from "../middlewares/admin.middleware.js";
import { sendEmailToUsers, listEmailLog } from "../controllers/emailController.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.use(authenticate, authorizeAdmin);

router.post("/send", upload.single("image"), sendEmailToUsers);
router.get("/log", listEmailLog);

export default router;
