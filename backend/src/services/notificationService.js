import * as NotificationModel from "../models/notificationModel.js";
import { getIO } from "../socket/index.js";

export const listNotifications = async () => {
    return NotificationModel.getAllNotifications();
};

export const getUnreadCount = async () => {
    return NotificationModel.getUnreadCount();
};

// This is the one place every notification in the app flows through
// (login, logout, order status changes, return requests, new signups...),
// so this is where the live push to admins happens.
export const createNotification = async (payload) => {
    const result = await NotificationModel.createNotification(payload);

    try {
        getIO().to("admins").emit("admin:new-notification", {
            ...payload,
            notification_id: result?.insertId ?? result?.notification_id ?? null,
            is_read: false,
            created_at: new Date().toISOString(),
        });
    } catch (err) {
        // Socket.IO not initialized yet (e.g. a seed/migration script run
        // outside the normal server startup) — don't let that break the
        // actual notification write.
        console.warn("Socket emit skipped:", err.message);
    }

    return result;
};

export const markRead = async (notificationId) => {
    return NotificationModel.markNotificationRead(notificationId);
};

export const markAllRead = async () => {
    return NotificationModel.markAllNotificationsRead();
};

export const removeNotification = async (notificationId) => {
    return NotificationModel.deleteNotification(notificationId);
};