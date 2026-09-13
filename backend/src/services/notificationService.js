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
    try {
        const result = await NotificationModel.createNotification(payload);

        try {
            getIO().to("admins").emit("admin:new-notification", {
                ...payload,
                notification_id: result?.insertId ?? result?.notification_id ?? null,
                is_read: false,
                created_at: new Date().toISOString(),
            });
        } catch (err) {
            console.warn("[Notification Service] Socket emit skipped:", err.message);
        }

        return result;
    } catch (err) {
        console.warn("[Notification Service] Failed to create notification:", err.message);
        return null;
    }
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