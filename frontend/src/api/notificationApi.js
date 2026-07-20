import axiosAdmin from "./axiosAdmin";

export const getNotifications = async () => {
    const { data } = await axiosAdmin.get("/admin/notifications");
    return data.notifications;
};

export const markNotificationRead = async (id) => {
    const { data } = await axiosAdmin.patch(`/admin/notifications/${id}/read`);
    return data;
};

export const markAllNotificationsRead = async () => {
    const { data } = await axiosAdmin.patch("/admin/notifications/read-all");
    return data;
};

export const deleteNotification = async (id) => {
    const { data } = await axiosAdmin.delete(`/admin/notifications/${id}`);
    return data;
};
