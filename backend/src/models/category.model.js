import pool from "../config/db.js";

export const getAllCategories = async () => {
    const [rows] = await pool.query(
        `
        SELECT
            category_id,
            parent_id,
            name,
            slug,
            image_url,
            description,
            sort_order,
            is_active,
            created_at,
            updated_at
        FROM categories
        ORDER BY sort_order ASC, name ASC
        `
    );

    return rows;
};

export const getCategoryByName = async (
    name,
    excludeCategoryId = null
) => {

    let query = `
        SELECT category_id
        FROM categories
        WHERE LOWER(name)=LOWER(?)
    `;

    const params = [name];

    if (excludeCategoryId) {

        query += " AND category_id != ?";

        params.push(excludeCategoryId);

    }

    query += " LIMIT 1";

    const [rows] = await pool.query(query, params);

    return rows[0] || null;

};

export const getCategoryBySlug = async (
    slug,
    excludeCategoryId = null
) => {

    let query = `
        SELECT category_id
        FROM categories
        WHERE slug = ?
    `;

    const params = [slug];

    if (excludeCategoryId) {

        query += " AND category_id != ?";

        params.push(excludeCategoryId);

    }

    query += " LIMIT 1";

    const [rows] = await pool.query(query, params);

    return rows[0] || null;

};

export const createCategory = async (category) => {

    const [result] = await pool.query(
        `
        INSERT INTO categories
        (
            parent_id,
            name,
            slug,
            image_url,
            description,
            sort_order
        )
        VALUES
        (?, ?, ?, ?, ?, ?)
        `,
        [
            category.parent_id,
            category.name,
            category.slug,
            category.image_url,
            category.description,
            category.sort_order
        ]
    );

    return result.insertId;
};

export const getCategoryById = async (categoryId) => {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM categories
        WHERE category_id = ?
        LIMIT 1
        `,
        [categoryId]
    );

    return rows[0] || null;

};

export const updateCategory = async (categoryId, category) => {

    const [result] = await pool.query(
        `
        UPDATE categories
        SET
            name = ?,
            slug = ?,
            image_url = ?,
            description = ?,
            updated_at = NOW()
        WHERE category_id = ?
        `,
        [
            category.name,
            category.slug,
            category.image_url,
            category.description,
            categoryId
        ]
    );

    return result.affectedRows;

};

export const softDeleteCategory = async (categoryId) => {

    const [result] = await pool.query(
        `
        UPDATE categories
        SET
            is_active = FALSE,
            updated_at = NOW()
        WHERE category_id = ?
        `,
        [categoryId]
    );

    return result.affectedRows;

};

export const getActiveProductCountByCategory = async (categoryId) => {

    const [rows] = await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM products
        WHERE category_id = ?
        AND is_active = TRUE
        `,
        [categoryId]
    );

    return rows[0].total;

};

export const restoreCategory = async (categoryId) => {

    const [result] = await pool.query(
        `
        UPDATE categories
        SET
            is_active = TRUE,
            updated_at = CURRENT_TIMESTAMP
        WHERE category_id = ?
        `,
        [categoryId]
    );

    return result.affectedRows;

};