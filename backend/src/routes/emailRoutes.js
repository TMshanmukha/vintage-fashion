import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeAdmin } from "../middlewares/admin.middleware.js";
import { sendEmailToUsers, listEmailLog } from "../controllers/emailController.js";

const router = Router();

router.use(authenticate, authorizeAdmin);

router.post("/send", sendEmailToUsers);
router.get("/log", listEmailLog);

export default router;
