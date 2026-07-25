import pool from "../config/db.js";

export const createOrder = async (connection, order) => {

    const [result] = await connection.query(
        `
        INSERT INTO orders
            (user_id, shipping_address_id, order_number, subtotal, discount_amount, shipping_fee, tax_amount, total_amount, order_status, payment_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')
        `,
        [
            order.user_id,
            order.shipping_address_id,
            order.order_number,
            order.subtotal,
            order.discount_amount,
            order.shipping_fee,
            order.tax_amount,
            order.total_amount
        ]
    );

    return result.insertId;

};

export const createOrderItem = async (connection, orderId, item) => {

    await connection.query(
        `
        INSERT INTO order_items
            (order_id, variant_id, product_name, sku_variant, size, color, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            orderId,
            item.variant_id,
            item.name,
            item.sku_variant,
            item.size,
            item.color,
            item.quantity,
            item.price,
            item.price * item.quantity
        ]
    );

};

export const decrementVariantStock = async (connection, variantId, quantity) => {

    await connection.query(
        `
        UPDATE product_variants
        SET stock_quantity = stock_quantity - ?
        WHERE variant_id = ? AND stock_quantity >= ?
        `,
        [quantity, variantId, quantity]
    );

};

export const getOrderById = async (userId, orderId) => {

    const [rows] = await pool.query(
        `SELECT * FROM orders WHERE order_id = ? AND user_id = ?`,
        [orderId, userId]
    );

    return rows[0];

};

export const updateOrderAfterPayment = async (connection, orderId, status) => {

    await connection.query(
        `
        UPDATE orders
        SET payment_status = ?, order_status = 'confirmed'
        WHERE order_id = ?
        `,
        [status, orderId]
    );

};

export const markOrderPaymentFailed = async (connection, orderId) => {

    await connection.query(
        `UPDATE orders SET payment_status = 'failed' WHERE order_id = ?`,
        [orderId]
    );

};
