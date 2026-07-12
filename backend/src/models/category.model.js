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
        WHERE is_active = TRUE
        ORDER BY sort_order ASC, name ASC
        `
    );

    return rows;
};

export const getCategoryByName = async (name) => {

    const [rows] = await pool.query(
        `
        SELECT category_id
        FROM categories
        WHERE LOWER(name)=LOWER(?)
        LIMIT 1
        `,
        [name]
    );

    return rows[0];
};

export const getCategoryBySlug = async (slug) => {

    const [rows] = await pool.query(
        `
        SELECT category_id
        FROM categories
        WHERE slug=?
        LIMIT 1
        `,
        [slug]
    );

    return rows[0];
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
        AND is_active = TRUE
        LIMIT 1
        `,
        [categoryId]
    );

    return rows[0] || null;

};