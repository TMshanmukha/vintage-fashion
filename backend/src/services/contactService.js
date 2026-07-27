import { sendAdminEmail } from "./emailService.js";
import * as NotificationService from "./notificationService.js";

// Set this in your .env — the inbox that should actually receive
// customer contact messages. If you'd rather look this up from a DB
// table of admin users instead of an env var, swap this line for a
// query (e.g. SELECT email FROM users WHERE role = 'admin' LIMIT 1)
// and loop sendAdminEmail over all of them.
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL;

export const submitContactMessage = async ({ name, email, subject, message }) => {

    const emailSubject = subject?.trim()
        ? `New contact message: ${subject}`
        : "New contact message";

    const emailBody =
        `You've received a new message via the storefront contact form.\n\n` +
        `From: ${name} (${email})\n\n` +
        `${message}`;

    if (ADMIN_NOTIFICATION_EMAIL) {
        await sendAdminEmail({
            to: ADMIN_NOTIFICATION_EMAIL,
            subject: emailSubject,
            body: emailBody,
        });
    } else {
        console.warn("ADMIN_NOTIFICATION_EMAIL not set — skipping contact form email, notification only.");
    }

    // This is what pushes live to any connected admin tab, via the
    // socket emit already wired into createNotification.
    await NotificationService.createNotification({
        title: "New contact message",
        body: `${name} (${email}): ${subject?.trim() || message.slice(0, 80)}`,
        type: "contact",
    });

    return { success: true };
};
