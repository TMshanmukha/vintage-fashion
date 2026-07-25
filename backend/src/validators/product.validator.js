import { z } from "zod";

export const deleteProductSchema = z.object({

    product_id: z.coerce
        .number()
        .int()
        .positive()

});

export const updateProductSchema = z.object({
    product_id: z.coerce.number().int().positive(),
    category_id: z.coerce.number().int().positive(),
    brand_id: z.coerce.number().int().positive(),
    name: z.string().trim().min(2).max(180),
    description: z.string().trim().optional(),
    price: z.coerce.number().positive(),
    original_price: z.coerce.number().nonnegative().nullable().optional(),
    badge: z.string().trim().max(40).nullable().optional(),
    stock_quantity: z.coerce.number().int().nonnegative(),
    images: z.array(
        z.object({
            image_url: z.string().url(),
            alt_text: z.string().optional(),
            sort_order: z.number().int(),
            is_primary: z.boolean()
        })
    ).min(1),
    variants: z.array(
        z.object({
            size: z.string(),
            color: z.string(),
            color_hex: z.string(),
            sku_variant: z.string(),
            stock_quantity: z.coerce.number().int(),
            price_modifier: z.coerce.number()
        })
    )
});

export const getProductBySlugSchema = z.object({

    slug: z
        .string()
        .trim()
        .min(1, "Product slug is required.")

});
const emptyToUndefined = (val) => (val === "" ? undefined : val);

export const getProductsSchema = z.object({

    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(12),

    search: z.preprocess(emptyToUndefined, z.string().trim().optional()),

    category: z.preprocess(
        emptyToUndefined,
        z.coerce.number().int().positive().optional()
    ),

    brand: z.preprocess(
        emptyToUndefined,
        z.coerce.number().int().positive().optional()
    ),

    minPrice: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
    maxPrice: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),

    sort: z.preprocess(
        emptyToUndefined,
        z.enum([
            "newest",
            "oldest",
            "price_low_to_high",
            "price_high_to_low",
            "name_asc",
            "name_desc"
        ]).default("newest")
    )

});

const imageSchema = z.object({
    image_url: z
        .string()
        .trim()
        .url("Invalid image URL."),

    alt_text: z
        .string()
        .trim()
        .max(180)
        .optional()
        .nullable(),

    sort_order: z
        .number()
        .int()
        .min(1)
        .optional(),

    is_primary: z.boolean()
});

const variantSchema = z.object({
    size: z.string().trim().max(10).nullable().optional(),
    color: z.string().trim().max(30).nullable().optional(),
    color_hex: z.string().trim().max(7).nullable().optional(),
    image_url: z.string().trim().url().nullable().optional(),
    is_default: z.boolean().optional(),
    stock_quantity: z.coerce.number().int().min(0),
    price_modifier: z.coerce.number().default(0)
});

export const createProductSchema = z.object({
    category_id: z.coerce.number().int().positive(),
    brand_id: z.coerce.number().int().positive(),
    name: z.string().trim().min(3).max(180),
    description: z.string().trim().optional().nullable(),
    price: z.coerce.number().positive(),
    original_price: z.coerce.number().positive().nullable().optional(),
    badge: z.string().trim().max(40).nullable().optional(),
    stock_quantity: z.coerce.number().int().min(0).optional(),
    images: z.array(imageSchema).min(1, "At least one image is required."),
    variants: z.array(variantSchema).optional()
});

