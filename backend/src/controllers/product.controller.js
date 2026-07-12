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

        const product = await updateProductService(
            req.params,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Product updated successfully.",
            data: product
        });

    } catch (error) {

        next(error);

    }

};

export const createProduct = async (req, res, next) => {

    try {

        const product = await createProductService(req.body);

        return res.status(201).json({
            success: true,
            message: "Product created successfully.",
            data: product
        });

    } catch (error) {

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