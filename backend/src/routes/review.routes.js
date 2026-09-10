import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeAdmin } from "../middlewares/admin.middleware.js";
import {
  getProductReviews,
  addReview,
  adminListReviews,
  adminDeleteReview,
} from "../controllers/review.controller.js";

const router = Router();

// Public / Customer routes
router.get("/product/:productId", getProductReviews);
router.post("/product/:productId", authenticate, addReview);

// Admin review moderation routes
router.get("/admin/all", authenticate, authorizeAdmin, adminListReviews);
router.get("/admin", authenticate, authorizeAdmin, adminListReviews);
router.delete("/admin/:reviewId", authenticate, authorizeAdmin, adminDeleteReview);

export default router;
