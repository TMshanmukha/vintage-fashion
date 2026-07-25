import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
    getWishlist,
    addWishlist,
    removeWishlist
} from "../controllers/wishlist.controller.js";

const router = Router();

// Customer only
router.use(authenticate);

router.get("/", getWishlist);
router.post("/", addWishlist);
router.delete("/:productId", removeWishlist);

export default router;

// In your main app/server file, mount alongside your other routes:
// import wishlistRoutes from "./routes/wishlist.routes.js";
// app.use("/api/wishlist", wishlistRoutes);
