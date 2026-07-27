import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
    getCart,
    addCartItem,
    updateCartItem,
    removeCartItem
} from "../controllers/cart.controller.js";

const router = Router();

// Customer only
router.use(authenticate);

router.get("/", getCart);
router.post("/", addCartItem);
router.patch("/:cartItemId", updateCartItem);
router.delete("/:cartItemId", removeCartItem);

export default router;

// In your main app/server file, mount alongside your other routes:
// import cartRoutes from "./routes/cart.routes.js";
// app.use("/api/cart", cartRoutes);
