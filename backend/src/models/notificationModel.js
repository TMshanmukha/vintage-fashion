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
    type = "order",
    referenceId = null
}) => {

    const [result] = await pool.query(
        `
        INSERT INTO notifications (title, body, type, reference_id)
        VALUES (?, ?, ?, ?)
        `,
        [title, body, type, referenceId]
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
