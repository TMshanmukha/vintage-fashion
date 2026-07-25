import pool from "../config/db.js";

export const getOrCreateCart = async (userId) => {

    const [rows] = await pool.query(
        `SELECT cart_id FROM carts WHERE user_id = ?`,
        [userId]
    );

    if (rows.length) {
        return rows[0].cart_id;
    }

    const [result] = await pool.query(
        `INSERT INTO carts (user_id) VALUES (?)`,
        [userId]
    );

    return result.insertId;

};

export const upsertCartItem = async (cartId, variantId, quantity) => {

    await pool.query(
        `
        INSERT INTO cart_items (cart_id, variant_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
            quantity = quantity + VALUES(quantity)
        `,
        [cartId, variantId, quantity]
    );

};

export const setCartItemQuantity = async (cartItemId, cartId, quantity) => {

    const [result] = await pool.query(
        `
        UPDATE cart_items
        SET quantity = ?
        WHERE cart_item_id = ? AND cart_id = ?
        `,
        [quantity, cartItemId, cartId]
    );

    return result;

};

export const deleteCartItem = async (cartItemId, cartId) => {

    const [result] = await pool.query(
        `
        DELETE FROM cart_items
        WHERE cart_item_id = ? AND cart_id = ?
        `,
        [cartItemId, cartId]
    );

    return result;

};

export const getCartItems = async (cartId) => {

    const [rows] = await pool.query(
        `
        SELECT
            ci.cart_item_id,
            ci.variant_id,
            ci.quantity,

            p.product_id,
            p.name,
            p.slug,
            (p.price + v.price_modifier) AS price,

            v.size,
            v.color,
            v.sku_variant,
            v.stock_quantity AS variant_stock,

            pi.image_url

        FROM cart_items ci

        JOIN product_variants v
            ON ci.variant_id = v.variant_id

        JOIN products p
            ON v.product_id = p.product_id

        LEFT JOIN (
            SELECT product_id, MIN(image_id) AS image_id
            FROM product_images
            WHERE is_primary = TRUE
            GROUP BY product_id
        ) primary_img
            ON primary_img.product_id = p.product_id

        LEFT JOIN product_images pi
            ON pi.image_id = primary_img.image_id

        WHERE ci.cart_id = ?

        ORDER BY ci.added_at DESC
        `,
        [cartId]
    );

    return rows;

};

export const getVariantById = async (variantId) => {

    const [rows] = await pool.query(
        `SELECT * FROM product_variants WHERE variant_id = ?`,
        [variantId]
    );

    return rows[0];

};