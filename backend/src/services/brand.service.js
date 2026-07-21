import slugify from "slugify";

import {
  getBrands,
  countBrands,
  getBrandBySlug,
  getBrandById,
  createBrand,
  updateBrand,
  softDeleteBrand
} from "../models/brand.model.js";

import {
  getBrandsSchema,
  createBrandSchema,
  updateBrandSchema,
  getBrandBySlugSchema,
  deleteBrandSchema
} from "../validators/brand.validator.js";

import * as NotificationService from "./notificationService.js";

export const getBrandsService = async (query) => {
  const filters = getBrandsSchema.parse(query);
  const offset = (filters.page - 1) * filters.limit;

  const brands = await getBrands({ ...filters, offset });
  const totalItems = await countBrands(filters);
  const totalPages = Math.ceil(totalItems / filters.limit);

  return {
    brands,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      totalItems,
      totalPages
    }
  };
};

export const getBrandBySlugService = async (params) => {
  const { slug } = getBrandBySlugSchema.parse(params);
  const brand = await getBrandBySlug(slug);

  if (!brand) throw new Error("Brand not found.");
  return brand;
};

export const createBrandService = async (body) => {
  const validated = createBrandSchema.parse(body);
  validated.slug = slugify(validated.name, { lower: true, strict: true });

  const brandId = await createBrand(validated);

  const brandID = await getBrandById(brandId);

  await NotificationService.createNotification({
      title: "Brand Added",
      body: `${brand_name} was added.`,
      type: "content",
      referenceId: brandID
  });

  return brandID;
};

export const updateBrandService = async (params, body) => {
  const parsed = updateBrandSchema.parse({
    brand_id: params.id,
    ...body
  });

  const existing = await getBrandById(parsed.brand_id);
  if (!existing) throw new Error("Brand not found.");

  parsed.slug = slugify(parsed.name, { lower: true, strict: true });

  // Keep the current logo if a new one wasn't uploaded this time
  if (!parsed.logo_url) {
    parsed.logo_url = existing.logo_url;
  }

  await updateBrand(parsed);

  const brandID = await getBrandById(parsed.brand_id);
  await NotificationService.createNotification({
      title: "Brand Updated",
      body: `${brand_name} was updated.`,
      type: "content",
      referenceId: brandID
  });

  return brandID;
};

export const deleteBrandService = async (params) => {
  const { brand_id } = deleteBrandSchema.parse({ brand_id: params.id });

  const existing = await getBrandById(brand_id);
  if (!existing) throw new Error("Brand not found.");

  await softDeleteBrand(brand_id);

  await NotificationService.createNotification({
      title: "Brand Deleted",
      body: `${brand_name} was removed.`,
      type: "content",
      referenceId: existing
  });
};