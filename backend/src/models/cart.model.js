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


export const upsertCartItem = async (cartId, variantId, quantity, pricing) => {
    await pool.query(
        `
    INSERT INTO cart_items
      (cart_id, variant_id, quantity, original_price, discount_percent, discount_amount, final_price, promotion_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      quantity = quantity + VALUES(quantity)
      -- pricing intentionally NOT updated on duplicate — re-resolved fresh at checkout instead
    `,
        [cartId, variantId, quantity, pricing.original_price, pricing.discount_percent, pricing.discount_amount, pricing.final_price, pricing.promotion_id]
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

            ci.original_price,
            ci.discount_percent,
            ci.discount_amount,
            ci.final_price,
            ci.promotion_id,

            p.product_id,
            p.name,
            p.slug,
            (p.price + v.price_modifier) AS variant_price,

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

    // final_price is frozen at add-to-cart time via upsertCartItem. It's what
    // the customer actually gets charged. variant_price (live) is only kept
    // as a fallback for any pre-migration rows where final_price is NULL.
    return rows.map((row) => {
        const finalPrice = Number(row.final_price);
        const variantPrice = Number(row.variant_price);
        const safePrice = !isNaN(finalPrice) && finalPrice >= 0
            ? finalPrice
            : (!isNaN(variantPrice) ? variantPrice : 0);
        const originalPrice = Number(row.original_price);
        const safeOriginalPrice = !isNaN(originalPrice) && originalPrice >= safePrice
            ? originalPrice
            : safePrice;

        return {
            ...row,
            price: safePrice,
            original_price: safeOriginalPrice,
            discount_percent: Number(row.discount_percent) || 0,
            discount_amount: Number(row.discount_amount) || 0,
            quantity: Number(row.quantity) || 1,
        };
    });

};

export const getVariantById = async (variantId) => {

    const [rows] = await pool.query(
        `
        SELECT
            v.*,
            p.product_id,
            (p.price + v.price_modifier) AS price,
            p.original_price
        FROM product_variants v
        JOIN products p ON p.product_id = v.product_id
        WHERE v.variant_id = ?
        `,
        [variantId]
    );

    return rows[0];

};