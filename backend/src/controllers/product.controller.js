import { getProductsService,getProductBySlugService } from "../services/product.service.js";

import { createProductService,updateProductService,deleteProductService } from "../services/product.service.js";

export const deleteProduct = async (req, res, next) => {

    try {

        await deleteProductService(req.params);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully."
        });

    } catch (error) {

        next(error);

    }

};

export const updateProduct = async (req, res, next) => {

    try {

        const body = {
            ...req.body,

            images: req.body.images
                ? JSON.parse(req.body.images)
                : [],

            variants: req.body.variants
                ? JSON.parse(req.body.variants)
                : []
        };

        if (req.files?.length) {

            body.images = req.files.map((file, index) => ({
                image_url: file.path,
                alt_text: body.name,
                sort_order: index + 1,
                is_primary: index === 0
            }));

        }

        const product =
            await updateProductService(
                req.params,
                body
            );

        return res.status(200).json({

            success: true,
            message: "Product updated successfully.",
            data: product

        });

    }

    catch (error) {

        next(error);

    }

};
export const createProduct = async (req, res, next) => {

    try {

        const body = {
            ...req.body,

            images: req.body.images
                ? JSON.parse(req.body.images)
                : [],

            variants: req.body.variants
                ? JSON.parse(req.body.variants)
                : []
        };

        // Cloudinary uploaded images
        if (req.files?.length) {

            body.images = req.files.map((file, index) => ({
                image_url: file.path,
                alt_text: body.name,
                sort_order: index + 1,
                is_primary: index === 0
            }));

        }

        const product =
            await createProductService(body);

        return res.status(201).json({

            success: true,
            message: "Product created successfully.",
            data: product

        });

    }

    catch (error) {

        next(error);

    }

};

export const getProductBySlug = async (req, res) => {

    try {

        const product =
            await getProductBySlugService(req.params);

        return res.status(200).json({

            success: true,

            message: "Product fetched successfully.",

            data: product

        });

    }

    catch (error) {

        if (error.message === "PRODUCT_NOT_FOUND") {

            return res.status(404).json({

                success: false,

                message: "Product not found."

            });

        }

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }

};

export const getProducts = async (req, res) => {

    try {

        const result =
        await getProductsService(req.query);

        return res.status(200).json({

            success: true,

            message: "Products fetched successfully.",

            data: result.products,

            pagination: result.pagination

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error"

        });

    }

};