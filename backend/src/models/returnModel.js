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
        `SELECT * FROM returns WHERE order_id = ? ORDER BY created_at DESC LIMIT 1`,
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
            COALESCE(o.total_amount, 0) AS total_amount,
            COALESCE(u.name, 'Customer') AS customer_name,
            COALESCE(u.email, '—') AS customer_email
        FROM returns r
        LEFT JOIN orders o ON o.order_id = r.order_id
        LEFT JOIN users u ON u.user_id = r.user_id
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

export const updateReturnStatus = async (returnId, status, pickupTrackingId = null) => {
    if (pickupTrackingId) {
        await pool.query(
            `UPDATE returns SET status = ?, pickup_tracking_id = ? WHERE return_id = ?`,
            [status, pickupTrackingId, returnId]
        );
    } else {
        await pool.query(
            `UPDATE returns SET status = ? WHERE return_id = ?`,
            [status, returnId]
        );
    }
};

export const getReturnById = async (returnId) => {
    const [rows] = await pool.query(`SELECT * FROM returns WHERE return_id = ?`, [returnId]);
    return rows[0] || null;
};