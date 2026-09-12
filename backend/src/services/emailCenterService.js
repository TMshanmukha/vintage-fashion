import * as EmailModel from "../models/emailModel.js";
import * as UserAdminService from "./userAdminService.js";
import * as NotificationService from "./notificationService.js";
import { sendAdminEmail } from "./emailService.js";

export const sendToAllUsers = async ({ subject, body, imageUrl, sentBy }) => {
    const customers = await UserAdminService.listCustomers();
    const recipients = (customers || []).filter(
        (c) => c.email && c.account_status !== "DELETED" && c.account_status !== "INACTIVE"
    );

    if (recipients.length === 0) {
        return 0;
    }

    const results = await Promise.allSettled(
        recipients.map((c) => sendAdminEmail({ to: c.email, subject, body, imageUrl }))
    );

    const successfulCount = results.filter(r => r.status === "fulfilled").length;

    await EmailModel.logEmail({
        recipientType: "all",
        recipientLabel: `All users (${successfulCount}/${recipients.length})`,
        subject,
        body,
        sentBy: sentBy || null
    });

    await NotificationService.createNotification({
        title: "Bulk email broadcast sent",
        body: `Broadcast "${subject}" sent to ${successfulCount} users`,
        type: "email"
    });

    return successfulCount || recipients.length;
};

export const sendToSingleUser = async ({ userId, subject, body, imageUrl, sentBy }) => {
    const user = await UserAdminService.getCustomer(userId);
    if (!user || !user.email) return null;

    await sendAdminEmail({ to: user.email, subject, body, imageUrl });

    await EmailModel.logEmail({
        recipientType: "single",
        recipientEmail: user.email,
        recipientLabel: user.name || user.email,
        subject,
        body,
        sentBy: sentBy || null
    });

    await NotificationService.createNotification({
        title: "Direct email sent",
        body: `Sent "${subject}" to ${user.email}`,
        type: "email"
    });

    return user;
};

export const listEmailLog = async () => {
    return EmailModel.getEmailLog();
};
