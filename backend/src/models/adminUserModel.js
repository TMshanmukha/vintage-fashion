import pool from "../config/db.js";

export const getAllCustomers = async () => {

    const [rows] = await pool.query(
        `
        SELECT
            u.user_id,
            u.name,
            u.email,
            u.phone,
            u.avatar_url,
            u.account_status,
            u.created_at,
            COUNT(o.order_id) AS orders_count
        FROM users u
        LEFT JOIN orders o ON o.user_id = u.user_id
        WHERE u.role = 'customer'
        GROUP BY u.user_id
        ORDER BY u.created_at DESC
        `
    );

    return rows;
};

export const getCustomerById = async (userId) => {

    const [rows] = await pool.query(
        `
        SELECT user_id, name, email, phone, avatar_url, account_status, created_at
        FROM users
        WHERE user_id = ? AND role = 'customer'
        LIMIT 1
        `,
        [userId]
    );

    return rows[0];
};

export const setUserStatus = async (userId, status) => {

    await pool.query(
        `UPDATE users SET account_status = ? WHERE user_id = ?`,
        [status, userId]
    );
};

// Soft delete — keeps history intact (orders reference user_id with ON DELETE RESTRICT anyway)
export const softDeleteUser = async (userId) => {

    await pool.query(
        `UPDATE users SET account_status = 'DELETED' WHERE user_id = ?`,
        [userId]
    );
};
