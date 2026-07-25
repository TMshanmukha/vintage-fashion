import pool from "../config/db.js";

export const getAllOrders = async ({ status, search, page = 1, limit = 20 }) => {

    const offset = (page - 1) * limit;
    const params = [];
    let where = "WHERE 1=1";

    if (status) {
        where += " AND o.order_status = ?";
        params.push(status);
    }

    if (search) {
        where += " AND (o.order_number LIKE ? OR u.name LIKE ? OR u.email LIKE ?)";
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.query(
        `
        SELECT
            o.order_id,
            o.order_number,
            o.total_amount,
            o.order_status,
            o.payment_status,
            o.ordered_at,
            u.user_id,
            u.name AS customer_name,
            u.email AS customer_email,
            COUNT(oi.order_item_id) AS item_count
        FROM orders o
        JOIN users u ON u.user_id = o.user_id
        LEFT JOIN order_items oi ON oi.order_id = o.order_id
        ${where}
        GROUP BY o.order_id
        ORDER BY o.ordered_at DESC
        LIMIT ? OFFSET ?
        `,
        [...params, Number(limit), Number(offset)]
    );

    const [[{ total }]] = await pool.query(
        `
        SELECT COUNT(DISTINCT o.order_id) AS total
        FROM orders o
        JOIN users u ON u.user_id = o.user_id
        ${where}
        `,
        params
    );

    return { rows, total };
};



export const getOrderById = async (orderId) => {


    const [rows] = await pool.query(
        `
        SELECT
            o.*,
            u.name AS customer_name,
            u.email AS customer_email,
            u.phone AS customer_phone,
            a.address_line1,
            a.address_line2,
            a.city,
            a.state,
            a.pincode,
            a.country
        FROM orders o
        JOIN users u ON u.user_id = o.user_id
        JOIN user_addresses a ON a.address_id = o.shipping_address_id
        WHERE o.order_id = ?
        LIMIT 1
        `,
        [orderId]
    );

    return rows[0];
};

export const getOrderItems = async (orderId) => {

    const [rows] = await pool.query(
        `
        SELECT order_item_id, variant_id, product_name, sku_variant, size, color, quantity, unit_price, total_price
        FROM order_items
        WHERE order_id = ?
        `,
        [orderId]
    );

    return rows;
};

export const getOrderPayment = async (orderId) => {

    const [rows] = await pool.query(
        `SELECT * FROM payments WHERE order_id = ? LIMIT 1`,
        [orderId]
    );

    return rows[0];
};

export const updateOrderStatus = async (orderId, status) => {

    await pool.query(
        `UPDATE orders SET order_status = ? WHERE order_id = ?`,
        [status, orderId]
    );
};

export const updatePaymentStatus = async (orderId, status) => {

    await pool.query(
        `
        UPDATE payments
        SET payment_status = ?, paid_at = IF(? = 'success', NOW(), paid_at)
        WHERE order_id = ?
        `,
        [status, status, orderId]
    );

    await pool.query(
        `UPDATE orders SET payment_status = ? WHERE order_id = ?`,
        [status === "success" ? "paid" : status, orderId]
    );
};

export const getOrderStats = async () => {

    const [[stats]] = await pool.query(
        `
        SELECT
            COUNT(*) AS total_orders,
            SUM(CASE WHEN order_status = 'pending' THEN 1 ELSE 0 END) AS pending_orders,
            SUM(CASE WHEN order_status = 'delivered' THEN 1 ELSE 0 END) AS delivered_orders,
            COALESCE(SUM(total_amount), 0) AS total_revenue
        FROM orders
        `
    );

    return stats;
};

export const getOrdersByUserId = async (userId, { page = 1, limit = 20 } = {}) => {
    console.log("Fetching orders for user:", userId);
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
        `SELECT order_id, order_number, subtotal, discount_amount, shipping_fee,
            tax_amount, total_amount, order_status, payment_status, ordered_at
     FROM orders
     WHERE user_id = ?
     ORDER BY ordered_at DESC
     LIMIT ? OFFSET ?`,
        [userId, Number(limit), Number(offset)]
    );

    const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) AS total FROM orders WHERE user_id = ?`,
        [userId]
    );
    console.log(rows);

    return { rows, total };
};

// Confirms the order belongs to this user before letting them touch it
export const getOrderOwnedByUser = async (orderId, userId) => {
    const [rows] = await pool.query(
        `SELECT order_id, order_status, user_id FROM orders WHERE order_id = ? AND user_id = ?`,
        [orderId, userId]
    );
    return rows[0] || null;
};

// Scoped to a specific customer — never trust orderId alone without checking ownership
export const getOrderByIdForUser = async (orderId, userId) => {
  const [rows] = await pool.query(
    `SELECT * FROM orders WHERE order_id = ? AND user_id = ? LIMIT 1`,
    [orderId, userId]
  );
  return rows[0] || null;
};

export const setOrderStatusForUser = async (orderId, userId, status) => {
  const [result] = await pool.query(
    `UPDATE orders SET order_status = ? WHERE order_id = ? AND user_id = ?`,
    [status, orderId, userId]
  );
  return result.affectedRows > 0;
};