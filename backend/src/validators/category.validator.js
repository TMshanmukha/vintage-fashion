import { z } from "zod";

export const createCategorySchema = z.object({
    parent_id: z
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),

    name: z
        .string()
        .trim()
        .min(2, "Category name must be at least 2 characters.")
        .max(100, "Category name cannot exceed 100 characters."),

    image_url: z
        .string()
        .trim()
        .url("Invalid image URL.")
        .nullable()
        .optional(),

    description: z
        .string()
        .trim()
        .max(1000)
        .nullable()
        .optional(),

    sort_order: z
        .number()
        .int()
        .min(0)
        .optional()
});