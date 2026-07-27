import express from "express";

import {
    getBrands,
    getBrandBySlug,
    createBrand,
    updateBrand,
    deleteBrand
} from "../controllers/brand.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeAdmin } from "../middlewares/admin.middleware.js";
import upload from "../middlewares/brandUpload.middleware.js";

const router = express.Router();

router.get("/", getBrands);
router.get("/:slug", getBrandBySlug);

router.post("/", authenticate, authorizeAdmin, upload.single("logo"), createBrand);
router.put("/:id", authenticate, authorizeAdmin, upload.single("logo"), updateBrand);
router.delete("/:id", authenticate, authorizeAdmin, deleteBrand);

export default router;