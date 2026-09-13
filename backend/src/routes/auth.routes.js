import express from "express";
import {
    signup,
    login,
    logout,
    refresh,
    forgotPassword,
    resetPassword,
    sendOtp,
    verifyOtp,
    adminLogin,
    adminLogout,
    adminRefresh
} from "../controllers/auth.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/refresh", refresh);

router.post("/signup", (req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("multipart/form-data")) {
    return next();
  }
  upload.single("avatar")(req, res, (err) => {
    if (err) {
      console.error("UPLOAD ERROR:", err);
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
}, signup);

router.post("/login", login);

router.post( "/logout",logout);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

router.post("/admin/login", adminLogin);

router.post("/admin/logout", adminLogout);

router.post("/admin/refresh", adminRefresh);

export default router;