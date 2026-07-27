import express from "express";
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    restoreCategory
} from "../controllers/category.controller.js";

import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/", getCategories);

router.post(
    "/",
    upload.single("image"),
    createCategory
);

router.put(
    "/:id",
    upload.single("image"),
    updateCategory
);

router.delete("/:id", deleteCategory);

router.patch("/:id/restore", restoreCategory);

export default router;