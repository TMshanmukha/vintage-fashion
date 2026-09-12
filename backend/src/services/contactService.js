import { sendAdminEmail } from "./emailService.js";
import * as NotificationService from "./notificationService.js";

// Set this in your .env — the inbox that should actually receive
// customer contact messages. If you'd rather look this up from a DB
// table of admin users instead of an env var, swap this line for a
// query (e.g. SELECT email FROM users WHERE role = 'admin' LIMIT 1)
// and loop sendAdminEmail over all of them.
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "shanmu547@gmail.com";

export const submitContactMessage = async ({ name, email, subject, message }) => {
    const emailSubject = subject?.trim()
        ? `New contact message: ${subject}`
        : "New contact message";

    const emailBody =
        `You've received a new message via the storefront contact form.\n\n` +
        `From: ${name} (${email})\n\n` +
        `Message:\n${message}`;

    // 1. Send alert email to Store Admin
    try {
        await sendAdminEmail({
            to: ADMIN_NOTIFICATION_EMAIL,
            customerName: "Store Admin",
            subject: emailSubject,
            body: emailBody,
        });
    } catch (adminErr) {
        console.warn("Failed to notify admin via email:", adminErr.message);
    }

    // 2. Send immediate acknowledgment greeting email to Customer
    if (email) {
        try {
            await sendAdminEmail({
                to: email,
                customerName: name || "Valued Customer",
                subject: "Thank you for contacting Vintage Fashion ✨",
                body: `Hello ${name || "there"},\n\nThank you for reaching out to Vintage Fashion! We have received your inquiry regarding "${subject || "Customer Support"}".\n\nOur team is reviewing your message and will get back to you as soon as possible.\n\nWarm regards,\nVintage Fashion Team`,
            });
        } catch (custErr) {
            console.warn("Failed to send acknowledgment email to customer:", custErr.message);
        }
    }

    // 3. Create real-time Admin notification & Socket event
    await NotificationService.createNotification({
        title: "New contact message",
        body: `${name} (${email}): ${subject?.trim() || message.slice(0, 80)}`,
        type: "contact",
    });

    return { success: true };
};
