import * as EmailModel from "../models/emailModel.js";
import * as UserAdminService from "./userAdminService.js";
import * as NotificationService from "./notificationService.js";
import { sendAdminEmail } from "./emailService.js";

export const sendToAllUsers = async ({ subject, body, imageUrl, sentBy }) => {
    const customers = await UserAdminService.listCustomers();
    const recipients = customers.filter((c) => c.account_status === "ACTIVE");

    await Promise.all(
        recipients.map((c) => sendAdminEmail({ to: c.email, subject, body, imageUrl }))
    );

    await EmailModel.logEmail({
        recipientType: "all",
        recipientLabel: `All users (${recipients.length})`,
        subject,
        body,
        sentBy
    });

    await NotificationService.createNotification({
        title: "Bulk email sent",
        body: `Sent "${subject}" to ${recipients.length} users`,
        type: "email"
    });

    return recipients.length;
};

export const sendToSingleUser = async ({ userId, subject, body, imageUrl, sentBy }) => {
    const user = await UserAdminService.getCustomer(userId);
    if (!user) return null;

    await sendAdminEmail({ to: user.email, subject, body, imageUrl });

    await EmailModel.logEmail({
        recipientType: "single",
        recipientEmail: user.email,
        recipientLabel: user.name,
        subject,
        body,
        sentBy
    });

    await NotificationService.createNotification({
        title: "Email sent",
        body: `Sent "${subject}" to ${user.email}`,
        type: "email"
    });

    return user;
};

export const listEmailLog = async () => {
    return EmailModel.getEmailLog();
};
