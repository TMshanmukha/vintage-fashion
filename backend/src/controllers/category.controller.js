import { ZodError } from "zod";
import {
    getCategoriesService,
    createCategoryService,
    updateCategoryService,
    deleteCategoryService,
    restoreCategoryService
} from "../services/category.service.js";

export const restoreCategory = async (req, res) => {

    try {

        await restoreCategoryService(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Category restored successfully."
        });

    } catch (error) {

        console.error(error);

        if (error.message === "Category not found.") {

            return res.status(404).json({
                success: false,
                message: error.message
            });

        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

export const getCategories = async (req, res) => {
    try {

        const categories = await getCategoriesService();

        return res.status(200).json({
            success: true,
            message: "Categories fetched successfully.",
            data: categories
        });

    } catch (error) {

        console.error("Get Categories Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};

export const createCategory = async (req, res) => {

    try {

        const category = await createCategoryService({

            ...req.body,

            image_url: req.file?.path || null

        });
        return res.status(201).json({
            success: true,
            message: "Category created successfully.",
            data: category
        });

    } catch (error) {

        console.error("Create Category Error:", error);

        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: error.errors[0].message
            });
        }

        if (
            error.message === "Category name already exists." ||
            error.message === "Category slug already exists."
        ) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

export const updateCategory = async (req, res) => {

    try {

        const { id } = req.params;

        const category = await updateCategoryService(
            Number(id),
            {
                ...req.body,
                image_url: req.file?.path
            }
        );

        return res.status(200).json({
            success: true,
            message: "Category updated successfully.",
            data: category
        });

    } catch (error) {

        console.error("Update Category Error:", error);

        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                message: error.errors[0].message
            });
        }

        if (error.message === "Category not found.") {

            return res.status(404).json({
                success: false,
                message: error.message
            });

        }

        if (
            error.message === "Category name already exists." ||
            error.message === "Category slug already exists."
        ) {

            return res.status(409).json({
                success: false,
                message: error.message
            });

        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

export const deleteCategory = async (req, res) => {

    try {

        const { id } = req.params;

        await deleteCategoryService(Number(id));

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully."
        });

    } catch (error) {

        console.error("Delete Category Error:", error);

        if (
            error.message === "Category not found."
        ) {

            return res.status(404).json({
                success: false,
                message: error.message
            });

        }

        if (
            error.message.includes("active product")
        ) {

            return res.status(400).json({
                success: false,
                message: error.message
            });

        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};