import {
    getAllCategories,
    getCategoryByName,
    getCategoryBySlug,
    createCategory
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
        ...validatedData,
        slug
    };

    const insertId = await createCategory(category);

    return {
        category_id: insertId,
        ...category
    };
};