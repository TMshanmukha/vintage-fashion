import * as AdminUserModel from "../models/adminUserModel.js";
import * as NotificationService from "./notificationService.js";

export const listCustomers = async () => {
    return AdminUserModel.getAllCustomers();
};

export const getCustomer = async (userId) => {
    return AdminUserModel.getCustomerById(userId);
};

export const toggleUserStatus = async (userId, status) => {
    const user = await AdminUserModel.getCustomerById(userId);
    if (!user) return null;

    await AdminUserModel.setUserStatus(userId, status);

    await NotificationService.createNotification({
        title: `User ${status.toLowerCase()}`,
        body: `${user.name} is now ${status.toLowerCase()}`,
        type: "user",
        referenceId: userId
    });

    return user;
};

export const removeCustomer = async (userId) => {
    const user = await AdminUserModel.getCustomerById(userId);
    if (!user) return null;

    await AdminUserModel.softDeleteUser(userId);

    await NotificationService.createNotification({
        title: "User removed",
        body: `${user.name} was deleted`,
        type: "user",
        referenceId: userId
    });

    return user;
};
