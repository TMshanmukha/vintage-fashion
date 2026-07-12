import { ZodError } from "zod";
import {
    getCategoriesService,
    createCategoryService
} from "../services/category.service.js";

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

        const category = await createCategoryService(req.body);

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