import express from "express";
import { signup, login, logout,forgotPassword,resetPassword,refresh } from "../controllers/auth.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

// ...
router.post("/refresh", refresh);

router.post("/signup", (req, res, next) => {
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

export default router;