import pool from "../config/db.js";

export const getAllNotifications = async () => {

    const [rows] = await pool.query(
        `
        SELECT notification_id, title, body, type, reference_id, is_read, created_at
        FROM notifications
        ORDER BY created_at DESC
        LIMIT 200
        `
    );

    return rows;
};

export const getUnreadCount = async () => {

    const [rows] = await pool.query(
        `SELECT COUNT(*) AS unread FROM notifications WHERE is_read = FALSE`
    );

    return rows[0].unread;
};

export const createNotification = async ({
    title,
    body,
    type = "content",
    referenceId = null
}) => {
    let cleanRefId = null;
    if (typeof referenceId === "number" || (typeof referenceId === "string" && /^\d+$/.test(referenceId))) {
        cleanRefId = parseInt(referenceId, 10);
    } else if (referenceId && typeof referenceId === "object") {
        const raw = referenceId.brand_id || referenceId.product_id || referenceId.order_id || referenceId.user_id || referenceId.id;
        if (raw && /^\d+$/.test(String(raw))) {
            cleanRefId = parseInt(raw, 10);
        }
    }

    const VALID_TYPES = ['order', 'stock', 'user', 'product', 'content', 'email', 'contact'];
    const notifType = VALID_TYPES.includes(type) ? type : 'content';

    const [result] = await pool.query(
        `
        INSERT INTO notifications (title, body, type, reference_id)
        VALUES (?, ?, ?, ?)
        `,
        [title, body, notifType, cleanRefId]
    );

    return result.insertId;
};

export const markNotificationRead = async (notificationId) => {

    await pool.query(
        `UPDATE notifications SET is_read = TRUE WHERE notification_id = ?`,
        [notificationId]
    );
};

export const markAllNotificationsRead = async () => {

    await pool.query(
        `UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE`
    );
};

export const deleteNotification = async (notificationId) => {

    await pool.query(
        `DELETE FROM notifications WHERE notification_id = ?`,
        [notificationId]
    );
};
