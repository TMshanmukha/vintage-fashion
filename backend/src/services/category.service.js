import {
    getAllCategories,
    getCategoryById,
    getCategoryByName,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    softDeleteCategory,
    getActiveProductCountByCategory,
    restoreCategory
} from "../models/category.model.js";

import { createCategorySchema } from "../validators/category.validator.js";
import { generateSlug } from "../utils/slug.js";

export const getCategoriesService = async () => {
    const categories = await getAllCategories();

    return categories;
};

export const createCategoryService = async (categoryData) => {

    // 1. Validate input
    const validatedData = createCategorySchema.parse(categoryData);

    // 2. Generate slug
    const slug = generateSlug(validatedData.name);

    // 3. Check duplicate name
    const existingName = await getCategoryByName(validatedData.name);

    if (existingName) {
        throw new Error("Category name already exists.");
    }

    // 4. Check duplicate slug
    const existingSlug = await getCategoryBySlug(slug);

    if (existingSlug) {
        throw new Error("Category slug already exists.");
    }

    // 5. Create category
    const category = {
        parent_id: validatedData.parent_id ?? null,
        name: validatedData.name,
        slug,
        image_url: validatedData.image_url ?? null,
        description: validatedData.description ?? "",
        sort_order: validatedData.sort_order ?? 0
    };

    const insertId = await createCategory(category);

    return {
        category_id: insertId,
        ...category
    };
};

export const updateCategoryService = async (
    categoryId,
    categoryData
) => {

    const existingCategory = await getCategoryById(categoryId);

    if (!existingCategory) {
        throw new Error("Category not found.");
    }

    const validatedData = createCategorySchema.parse(categoryData);

    const slug = generateSlug(validatedData.name);

    const existingName = await getCategoryByName(
        validatedData.name,
        categoryId
    );

    if (existingName) {
        throw new Error("Category name already exists.");
    }

    const existingSlug = await getCategoryBySlug(
        slug,
        categoryId
    );

    if (existingSlug) {
        throw new Error("Category slug already exists.");
    }

    const updatedCategory = {
        parent_id:
            validatedData.parent_id ??
            existingCategory.parent_id,

        name: validatedData.name,

        slug,

        image_url:
            validatedData.image_url ??
            existingCategory.image_url,

        description:
            validatedData.description ??
            existingCategory.description,

        sort_order:
            validatedData.sort_order ??
            existingCategory.sort_order
    };

    await updateCategory(
        categoryId,
        updatedCategory
    );

    return {
        category_id: categoryId,
        ...updatedCategory
    };

};

export const deleteCategoryService = async (categoryId) => {

    const existingCategory = await getCategoryById(categoryId);

    if (!existingCategory) {
        throw new Error("Category not found.");
    }

    const totalProducts =
        await getActiveProductCountByCategory(categoryId);

    if (totalProducts > 0) {

        throw new Error(
            `This category contains ${totalProducts} active product(s). Move or delete them before deleting this category.`
        );

    }

    await softDeleteCategory(categoryId);

};

export const restoreCategoryService = async (categoryId) => {

    const existingCategory =
        await getCategoryById(categoryId);

    if (!existingCategory) {
        throw new Error("Category not found.");
    }

    await restoreCategory(categoryId);

};