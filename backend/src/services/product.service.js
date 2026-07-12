import { getProducts,countProducts } from "../models/product.model.js";

import {
    getProductBySlug,
    getProductImages,
    getProductVariants,
    getRelatedProducts
} from "../models/product.model.js";

import pool from "../config/db.js";
import slugify from "slugify";

import {
    createProduct,
    deleteProductImages,
    deleteProductVariants,
    createProductImages,
    createProductVariants,
    getProductById,
    updateProductSku,
    updateProduct,
    softDeleteProduct
} from "../models/product.model.js";

import { getProductsSchema,createProductSchema,
        getProductBySlugSchema,updateProductSchema,deleteProductSchema  } from "../validators/product.validator.js";

import {
    generateSku,
    generateVariantSku
} from "../utils/generateSku.js";

import { getCategoryById } from "../models/category.model.js";
import { getBrandById } from "../models/brand.model.js";

export const deleteProductService = async (params) => {
    const connection = await pool.getConnection();

    const { product_id } = deleteProductSchema.parse({
        product_id: params.id
    });

    const product = await getProductById(product_id,connection);

    if (!product) {
        throw new Error("Product not found.");
    }

    await softDeleteProduct(product_id);

    return;
};

export const updateProductService = async (params, body) => {

    const connection = await pool.getConnection();

    try {

        const product = updateProductSchema.parse({
            product_id: params.id,
            ...body
        });

        await connection.beginTransaction();

        // Product exists?
        const existingProduct = await getProductById(
            product.product_id,
            connection
        );

        if (!existingProduct) {
            throw new Error("Product not found.");
        }

        // Category exists?
        const category = await getCategoryById(product.category_id);

        if (!category) {
            throw new Error("Category not found.");
        }

        // Brand exists?
        const brand = await getBrandById(product.brand_id);

        if (!brand) {
            throw new Error("Brand not found.");
        }

        const slug = product.name
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, "-")
                    .replace(/[^\w-]+/g, "");

        product.slug = slug;
        // Update product
        await updateProduct(product, connection);

        // Replace images
        await deleteProductImages(product.product_id, connection);

        console.log(product.images);
console.log(Array.isArray(product.images));

        await createProductImages(
            connection,
            product.product_id,
            product.images
        );

        // Replace variants
        await deleteProductVariants(
            product.product_id,
            connection
        );

        await createProductVariants(
            product.product_id,
            product.variants,
            connection
        );

        await connection.commit();

        return await getProductById(product.product_id,connection);

    } catch (error) {

        await connection.rollback();

        throw error;

    } finally {

        connection.release();

    }

};

export const getProductBySlugService = async (params) => {

    // Validate URL parameter
    const { slug } = getProductBySlugSchema.parse(params);

    // Get main product
    const product = await getProductBySlug(slug);

    if (!product) {
        throw new Error("Product not found.");
    }

    // Get all images
    const images = await getProductImages(product.product_id);

    // Get all variants
    const variants = await getProductVariants(product.product_id);

    // Combine everything
    return {
        ...product,
        images,
        variants
    };

};

export const getProductsService = async (query) => {

    const filters = getProductsSchema.parse(query);

    const page = filters.page;
    const limit = filters.limit;

    const offset = (page - 1) * limit;

    const products = await getProducts({
        ...filters,
        offset
    });

    const totalProducts = await countProducts(filters);

    const totalPages = Math.ceil(totalProducts / limit);

    return {

        products,

        pagination: {
            page,
            limit,
            totalProducts,
            totalPages
        }

    };

};

export const createProductService = async (productData) => {

    // Validate Request
    const validatedData = createProductSchema.parse(productData);

    // Generate Slug
    validatedData.slug = slugify(validatedData.name, {
        lower: true,
        strict: true
    });

    const category = await getCategoryById(validatedData.category_id);
    console.log(category);
    if (!category) {
        throw new Error("Category not found.");
    }

    const brand = await getBrandById(validatedData.brand_id);
    if (!brand) {
        throw new Error("Brand not found.");
    }

    const connection = await pool.getConnection();

    try {

        // Start Transaction
        await connection.beginTransaction();

        // Insert Product (SKU is NULL initially)
        const productId = await createProduct(
            connection,
            validatedData
        );

        // Generate Product SKU
        const productSku = generateSku(productId);

        // Update Product SKU
        await updateProductSku(
            connection,
            productId,
            productSku
        );

        // Generate Variant SKUs
        if (validatedData.variants?.length) {

            validatedData.variants = validatedData.variants.map((variant) => ({

                ...variant,

                sku_variant: generateVariantSku(
                    productSku,
                    variant.color,
                    variant.size
                )

            }));

            // Insert Variants
            await createProductVariants(
                connection,
                productId,
                validatedData.variants
            );
        }

        // Insert Images
        if (validatedData.images?.length) {

            await createProductImages(
                connection,
                productId,
                validatedData.images
            );

        }

        // Commit Transaction
        await connection.commit();

        // Fetch Created Product
        const product = await getProductById(
            connection,
            productId
        );

        return product;

    } catch (error) {

        await connection.rollback();

        throw error;

    } finally {

        connection.release();

    }

};



// export const getProductBySlugService = async (slug) => {

//     const product =
//         await getProductBySlug(slug);

//     if (!product) {
//         throw new Error("PRODUCT_NOT_FOUND");
//     }

//     const images =
//         await getProductImages(product.product_id);

//     const variants =
//         await getProductVariants(product.product_id);

//     const relatedProducts =
//         await getRelatedProducts(
//             product.category_id,
//             product.product_id
//         );

//     return {

//         ...product,

//         images,

//         variants,

//         relatedProducts

//     };

// };
