import { getProducts,countProducts } from "../models/product.model.js";
import { resolvePromotionForProduct, resolvePromotionsForProducts, applyPromotion } from "../services/pricing/pricing.service.js";

import {
    getProductBySlug,
    getProductImages,
    getProductVariants,
    getRelatedProducts,
} from "../models/product.model.js";

import pool from "../config/db.js";
import slugify from "slugify";

import {
    createProduct,
    deleteProductImages,
    deleteProductVariants,
    updateProductVariant,
    deleteProductVariant,
    createProductImages,
    createProductVariants,
    createProductVariant,
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

import * as NotificationService from "./notificationService.js";

export const deleteProductService = async (params) => {

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        const { product_id } = deleteProductSchema.parse({
            product_id: params.id
        });

        const product = await getProductById(
            connection,
            product_id
        );

        if (!product) {
            throw new Error("Product not found.");
        }

        await softDeleteProduct(
            product_id,
            connection
        );

        await connection.commit();

        await NotificationService.createNotification({
            title: "Product Removed",
            body: `${product.name} was removed.`,
            type: "product",
            referenceId: product.product_id
        });

        return;

    } catch (error) {

        await connection.rollback();

        throw error;

    } finally {

        connection.release();

    }

};

export const updateProductService = async (params, body) => {

    const connection = await pool.getConnection();

    try {

        let product = {
            product_id: params.id,
            ...body
        };

        if (Array.isArray(product.images)) {

            product.images = product.images.map(image => ({
                ...image,
                is_primary: Boolean(image.is_primary)
            }));

        }

        if (Array.isArray(product.variants)) {

            product.variants = product.variants.map(variant => ({
                ...variant,
                sku_variant: variant.sku_variant || ""
            }));

        }

        product.stock_quantity =
            (product.variants || []).reduce(
                (total, variant) =>
                    total + Number(variant.stock_quantity || 0),
                0
            );

        product = updateProductSchema.parse(product);

        await connection.beginTransaction();

        // Product exists?
        const existingProduct = await getProductById(
            connection,
            product.product_id
        );

        if (!existingProduct) {
            throw new Error("Product not found.");
        }


        if (product.variants?.length) {

            product.variants = product.variants.map((variant) => ({

                ...variant,

                sku_variant:
                    variant.sku_variant ||

                    generateVariantSku(
                        existingProduct.sku,
                        variant.color || "",
                        variant.size || ""
                    )

            }));

        }


        // Category exists?
        const [category, brand] = await Promise.all([
            getCategoryById(product.category_id),
            getBrandById(product.brand_id)
        ]);

        if (!category) {
            throw new Error("Category not found.");
        }

        if (!brand) {
            throw new Error("Brand not found.");
        }

        product.slug = slugify(product.name, {
            lower: true,
            strict: true
        });
        // Update product
        await updateProduct(product, connection);

        // Replace images
        await deleteProductImages(product.product_id, connection);

        // console.log(product.images);
        // console.log(Array.isArray(product.images));

        await createProductImages(
            connection,
            product.product_id,
            product.images
        );

        // Existing variants from DB
        const existingVariants = existingProduct.variants || [];

        // Incoming variants from frontend
        const incomingVariants = product.variants || [];

        // Existing variant IDs
        const existingIds = existingVariants.map(v => v.variant_id);

        // Incoming variant IDs
        const incomingIds = incomingVariants
            .filter(v => v.variant_id)
            .map(v => Number(v.variant_id));

        // Delete removed variants
        for (const variant of existingVariants) {

            if (!incomingIds.includes(variant.variant_id)) {

                await deleteProductVariant(
                    connection,
                    variant.variant_id
                );

                await NotificationService.createNotification({
                    title: "Product Updated",
                    body: `${product.name} was updated.`,
                    type: "product",
                    referenceId: existingProduct.product_id
                });

            }

        }


        // Update existing / Insert new
        for (const variant of incomingVariants) {

            if (variant.variant_id) {

                await updateProductVariant(
                    connection,
                    variant
                );

            } else {

                await createProductVariant(
                    connection,
                    product.product_id,
                    variant
                );

            }

        }

        await connection.commit();

        return await getProductById(connection,product.product_id);

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
        throw new Error("PRODUCT_NOT_FOUND");
    }

    // Parallel fetch promotion, images, and variants (cuts response time by 3x)
    const [promotion, images, variants] = await Promise.all([
        resolvePromotionForProduct(product.product_id),
        getProductImages(product.product_id),
        getProductVariants(product.product_id),
    ]);

    const pricing = applyPromotion(
        product.price,
        product.original_price,
        promotion
    );

    // Combine everything
    return {
        ...product,
        ...pricing,
        images,
        variants
    };

};

export const getProductsService = async (query) => {

    const filters = getProductsSchema.parse(query);

    const page = filters.page;
    const limit = filters.limit;

    const offset = (page - 1) * limit;

    // Fetch products and total count concurrently
    const [products, totalProducts] = await Promise.all([
        getProducts({
            ...filters,
            offset
        }),
        countProducts(filters),
    ]);

    const promotions = await resolvePromotionsForProducts(
        products.map(product => product.product_id)
    );

    const productsWithPricing = products.map(product => ({
        ...product,
        ...applyPromotion(
            product.price,
            product.original_price,
            promotions[product.product_id]
        )
    }));

    const totalPages = Math.ceil(totalProducts / limit);

    return {

        products: productsWithPricing,

        pagination: {
            page,
            limit,
            totalProducts,
            totalPages
        }

    };

};

export const createProductService = async (productData, files) => {

    // Variants come as JSON string from FormData
    if (typeof productData.variants === "string") {
        productData.variants = JSON.parse(productData.variants);
    }

    // Calculate total stock from variants BEFORE validation
    productData.stock_quantity =
        (productData.variants || []).reduce(
            (total, variant) =>
                total + Number(variant.stock_quantity || 0),
            0
        );

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

        await NotificationService.createNotification({
            title: "Product Added",
            body: `${productData.name} was added successfully.`,
            type: "product",
            referenceId: productId
        });

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

            validatedData.variants =
                (validatedData.variants || []).map((variant) => ({

                    ...variant,

                    sku_variant: generateVariantSku(
                        productSku,
                        variant.color || "",
                        variant.size || ""
                    )

            }));

            validatedData.variants = validatedData.variants.map((variant) => ({
                ...variant,
                is_default: variant.is_default ?? false
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