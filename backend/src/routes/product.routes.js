import express from "express";

import {
    getProducts,
    getProductBySlug,
    createProduct,
    updateProduct,
   deleteProduct
} from "../controllers/product.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeAdmin } from "../middlewares/admin.middleware.js";

const router = express.Router();

// ---------- Public ----------
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);

// ---------- Admin ----------
router.post(
    "/",
    authenticate,
    authorizeAdmin,
    createProduct
);

router.put(
    "/:id",
    authenticate,
    authorizeAdmin,
    updateProduct
);

router.delete(
    "/:id",
    authenticate,
    authorizeAdmin,
    deleteProduct
);

export default router;