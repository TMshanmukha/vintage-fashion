import * as NotificationModel from "../models/notificationModel.js";

export const listNotifications = async () => {
    return NotificationModel.getAllNotifications();
};

export const getUnreadCount = async () => {
    return NotificationModel.getUnreadCount();
};

export const createNotification = async (payload) => {
    return NotificationModel.createNotification(payload);
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
