import pool from "../config/db.js";

export const createReturn = async ({ orderId, userId, reason, description, photos }) => {
    const [result] = await pool.query(
        `INSERT INTO returns (order_id, user_id, reason, description, photos, status)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [orderId, userId, reason, description || null, JSON.stringify(photos || [])]
    );
    return result.insertId;
};

export const getReturnByOrderId = async (orderId) => {
    const [rows] = await pool.query(
        `SELECT
            r.*,
            COALESCE(o.order_number, r.order_id) AS order_number,
            COALESCE(o.subtotal, 0) AS subtotal,
            COALESCE(o.discount_amount, 0) AS discount_amount,
            COALESCE(o.shipping_fee, 0) AS shipping_fee,
            COALESCE(o.total_amount, 0) AS total_amount,
            COALESCE(o.delivery_method, 'COURIER') AS delivery_method,
            COALESCE(u.name, 'Customer') AS customer_name,
            COALESCE(u.email, '—') AS customer_email,
            COALESCE(u.phone, '—') AS customer_phone,
            a.address_line1,
            a.address_line2,
            a.city,
            a.state,
            a.pincode,
            a.country
         FROM returns r
         LEFT JOIN orders o ON o.order_id = r.order_id
         LEFT JOIN users u ON u.user_id = r.user_id
         LEFT JOIN user_addresses a ON a.address_id = o.shipping_address_id
         WHERE r.order_id = ?
         ORDER BY r.created_at DESC
         LIMIT 1`,
        [orderId]
    );
    return rows[0] || null;
};

export const getReturnByIdForUser = async (returnId, userId) => {
    const [rows] = await pool.query(
        `SELECT * FROM returns WHERE return_id = ? AND user_id = ?`,
        [returnId, userId]
    );
    return rows[0] || null;
};

export const getAllReturns = async ({ status, page = 1, limit = 20 } = {}) => {
    const offset = (page - 1) * limit;
    const params = [];
    let where = "WHERE 1=1";

    if (status) {
        where += " AND r.status = ?";
        params.push(status);
    }

    const [rows] = await pool.query(
        `
        SELECT
            r.*,
            COALESCE(o.order_number, r.order_id) AS order_number,
            COALESCE(o.subtotal, 0) AS subtotal,
            COALESCE(o.discount_amount, 0) AS discount_amount,
            COALESCE(o.shipping_fee, 0) AS shipping_fee,
            COALESCE(o.total_amount, 0) AS total_amount,
            COALESCE(o.delivery_method, 'COURIER') AS delivery_method,
            COALESCE(o.order_status, 'delivered') AS order_status,
            COALESCE(o.payment_status, 'paid') AS payment_status,
            COALESCE(u.name, 'Customer') AS customer_name,
            COALESCE(u.email, '—') AS customer_email,
            COALESCE(u.phone, '—') AS customer_phone,
            a.address_line1,
            a.address_line2,
            a.city,
            a.state,
            a.pincode,
            a.country
        FROM returns r
        LEFT JOIN orders o ON o.order_id = r.order_id
        LEFT JOIN users u ON u.user_id = r.user_id
        LEFT JOIN user_addresses a ON a.address_id = o.shipping_address_id
        ${where}
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
        `,
        [...params, Number(limit), Number(offset)]
    );

    const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) AS total FROM returns r ${where}`,
        params
    );

    return { rows, total };
};

export const updateReturnStatus = async (returnId, status, pickupTrackingId = null, extraData = {}) => {
    const fields = ["status = ?"];
    const params = [status];

    if (pickupTrackingId !== null) {
        fields.push("pickup_tracking_id = ?");
        params.push(pickupTrackingId);
    }
    if (extraData.refund_amount !== undefined) {
        fields.push("refund_amount = ?");
        params.push(extraData.refund_amount);
    }
    if (extraData.shipping_deduction !== undefined) {
        fields.push("shipping_deduction = ?");
        params.push(extraData.shipping_deduction);
    }
    if (extraData.return_delivery_method !== undefined) {
        fields.push("return_delivery_method = ?");
        params.push(extraData.return_delivery_method);
    }

    params.push(returnId);

    await pool.query(
        `UPDATE returns SET ${fields.join(", ")} WHERE return_id = ?`,
        params
    );
};

export const getReturnById = async (returnId) => {
    const [rows] = await pool.query(
        `
        SELECT
            r.*,
            COALESCE(o.order_number, r.order_id) AS order_number,
            COALESCE(o.subtotal, 0) AS subtotal,
            COALESCE(o.discount_amount, 0) AS discount_amount,
            COALESCE(o.shipping_fee, 0) AS shipping_fee,
            COALESCE(o.total_amount, 0) AS total_amount,
            COALESCE(o.delivery_method, 'COURIER') AS delivery_method,
            COALESCE(u.name, 'Customer') AS customer_name,
            COALESCE(u.email, '—') AS customer_email,
            COALESCE(u.phone, '—') AS customer_phone,
            a.address_line1,
            a.address_line2,
            a.city,
            a.state,
            a.pincode,
            a.country
        FROM returns r
        LEFT JOIN orders o ON o.order_id = r.order_id
        LEFT JOIN users u ON u.user_id = r.user_id
        LEFT JOIN user_addresses a ON a.address_id = o.shipping_address_id
        WHERE r.return_id = ?
        `,
        [returnId]
    );
    return rows[0] || null;
};