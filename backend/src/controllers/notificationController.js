import * as NotificationService from "../services/notificationService.js";

export const listNotifications = async (req, res) => {
    try {
        const notifications = await NotificationService.listNotifications();
        res.json({ notifications });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch notifications." });
    }
};

export const markRead = async (req, res) => {
    try {
        await NotificationService.markRead(req.params.id);
        res.json({ message: "Notification marked as read." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update notification." });
    }
};

export const markAllRead = async (req, res) => {
    try {
        await NotificationService.markAllRead();
        res.json({ message: "All notifications marked as read." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update notifications." });
    }
};

export const removeNotification = async (req, res) => {
    try {
        await NotificationService.removeNotification(req.params.id);
        res.json({ message: "Notification deleted." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete notification." });
    }
};
