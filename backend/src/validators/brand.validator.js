import { z } from "zod";

const booleanFromString = z.preprocess((val) => {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val === "true";
  return val;
}, z.boolean());

export const getBrandsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(20),
  search: z.string().trim().optional()
});

export const getBrandBySlugSchema = z.object({
  slug: z.string().trim().min(1, "Brand slug is required.")
});

export const createBrandSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(2000).optional().nullable(),
  logo_url: z.string().trim().url().optional().nullable()
});

export const updateBrandSchema = z.object({
  brand_id: z.coerce.number().int().positive(),
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(2000).optional().nullable(),
  logo_url: z.string().trim().url().optional().nullable(),
  is_active: booleanFromString
});

export const deleteBrandSchema = z.object({
  brand_id: z.coerce.number().int().positive()
});