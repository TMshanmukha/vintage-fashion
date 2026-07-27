import pool from "../config/db.js";

export const addToWishlist = async (userId, productId) => {

    const [result] = await pool.query(
        `
        INSERT IGNORE INTO wishlist_items (user_id, product_id)
        VALUES (?, ?)
        `,
        [userId, productId]
    );

    return result;

};

export const removeFromWishlistDb = async (userId, productId) => {

    const [result] = await pool.query(
        `
        DELETE FROM wishlist_items
        WHERE user_id = ? AND product_id = ?
        `,
        [userId, productId]
    );

    return result;

};

export const getWishlistByUser = async (userId) => {

    const [rows] = await pool.query(
        `
        SELECT
            w.wishlist_item_id,
            p.product_id,
            p.name,
            p.slug,
            p.price,
            p.original_price,
            pi.image_url

        FROM wishlist_items w

        JOIN products p
            ON w.product_id = p.product_id

        LEFT JOIN (
            SELECT product_id, MIN(image_id) AS image_id
            FROM product_images
            WHERE is_primary = TRUE
            GROUP BY product_id
        ) primary_img
            ON primary_img.product_id = p.product_id

        LEFT JOIN product_images pi
            ON pi.image_id = primary_img.image_id

        WHERE w.user_id = ?
          AND p.is_active = TRUE

        ORDER BY w.created_at DESC
        `,
        [userId]
    );

    return rows;

};
