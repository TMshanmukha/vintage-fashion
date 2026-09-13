import * as EmailModel from "../models/emailModel.js";
import * as UserAdminService from "./userAdminService.js";
import * as NotificationService from "./notificationService.js";
import { sendAdminEmail } from "./emailService.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const sendToAllUsers = async ({ subject, body, imageUrl, sentBy }) => {
    const customers = await UserAdminService.listCustomers();
    const recipients = (customers || []).filter(
        (c) => c.email && c.account_status !== "DELETED" && c.account_status !== "INACTIVE"
    );

    if (recipients.length === 0) {
        return 0;
    }

    // Process in batches of 5 with a 300ms pause to safely respect Resend rate limits
    const BATCH_SIZE = 5;
    let successfulCount = 0;

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
        const batch = recipients.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
            batch.map((c) =>
                sendAdminEmail({
                    to: c.email,
                    customerName: c.name || (c.email ? c.email.split("@")[0] : "Gentleman"),
                    subject,
                    body,
                    imageUrl
                })
            )
        );

        successfulCount += results.filter((r) => r.status === "fulfilled").length;

        if (i + BATCH_SIZE < recipients.length) {
            await sleep(350);
        }
    }

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

    return successfulCount;
};

export const sendToSingleUser = async ({ userId, subject, body, imageUrl, sentBy }) => {
    const user = await UserAdminService.getCustomer(userId);
    if (!user || !user.email) return null;

    const customerName = user.name || (user.email ? user.email.split("@")[0] : "Gentleman");

    await sendAdminEmail({
        to: user.email,
        customerName,
        subject,
        body,
        imageUrl
    });

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
