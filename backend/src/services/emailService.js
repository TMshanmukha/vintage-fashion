import resend from "../config/resend.js";

export const sendAdminEmail = async ({ to, subject, body }) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
    </head>

    <body style="
        margin:0;
        padding:40px 0;
        background:#f5f5f5;
        font-family:Arial, Helvetica, sans-serif;
        color:#333;
    ">

        <table
            align="center"
            width="600"
            cellpadding="0"
            cellspacing="0"
            style="
                background:#ffffff;
                border-radius:12px;
                overflow:hidden;
                box-shadow:0 6px 18px rgba(0,0,0,.08);
            "
        >

            <!-- Header -->
            <tr>
                <td
                    align="center"
                    style="
                        background:#111827;
                        color:#ffffff;
                        padding:30px;
                    "
                >
                    <h1 style="margin:0;font-size:28px;">
                        Vintage Fashion
                    </h1>

                    <p style="margin:8px 0 0;color:#d1d5db;">
                        Timeless Style • Modern Elegance
                    </p>
                </td>
            </tr>

            <!-- Content -->
            <tr>
                <td style="padding:40px;">

                    <h2 style="margin-top:0;color:#111827;">
                        ${subject}
                    </h2>

                    <div
                        style="
                            font-size:15px;
                            line-height:1.8;
                            color:#4b5563;
                        "
                    >
                        ${body.replace(/\n/g, "<br>")}
                    </div>

                    <hr
                        style="
                            margin:35px 0;
                            border:none;
                            border-top:1px solid #e5e7eb;
                        "
                    >

                    <p style="margin:0;">
                        Thank you for choosing
                        <strong>Vintage Fashion</strong>.
                    </p>

                    <p style="margin-top:12px;color:#6b7280;">
                        If you have any questions, simply reply to this email or
                        contact our support team.
                    </p>

                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td
                    align="center"
                    style="
                        background:#f9fafb;
                        padding:25px;
                        font-size:13px;
                        color:#6b7280;
                    "
                >
                    © ${new Date().getFullYear()} Vintage Fashion. All Rights Reserved.
                    <br><br>

                    This email was sent by the Vintage Fashion Store Management System.

                    <br><br>

                    <span style="color:#9ca3af;">
                        Please do not reply to automated emails.
                    </span>
                </td>
            </tr>

        </table>

    </body>
    </html>
    `;

    const data = await resend.emails.send({
        from: "Vintage Fashion <onboarding@resend.dev>",
        to,
        subject,
        html
    });

    console.log(data);
};

const formatINR = (value) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value || 0);

// Sent to the CUSTOMER right after a payment is verified successfully.
// Call this from wherever your checkout's verifyPayment logic confirms
// the Razorpay payment — pass the order + line items it just created.
// items shape expected: [{ product_name, size, color, quantity, total_price }]
export const sendOrderConfirmationEmail = async ({ to, customerName, orderNumber, items, totalAmount }) => {

    const itemsHtml = items.map((item) => `
        <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                <strong>${item.product_name}</strong><br>
                <span style="color:#9ca3af;font-size:13px;">
                    ${[item.size, item.color].filter(Boolean).join(" · ")} · Qty: ${item.quantity}
                </span>
            </td>
            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;white-space:nowrap;">
                ${formatINR(item.total_price)}
            </td>
        </tr>
    `).join("");

    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8" /></head>
    <body style="margin:0;padding:40px 0;background:#f5f5f5;font-family:Arial, Helvetica, sans-serif;color:#333;">
        <table align="center" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,.08);">

            <tr>
                <td align="center" style="background:#111827;color:#ffffff;padding:30px;">
                    <h1 style="margin:0;font-size:28px;">Vintage Fashion</h1>
                    <p style="margin:8px 0 0;color:#d1d5db;">Timeless Style • Modern Elegance</p>
                </td>
            </tr>

            <tr>
                <td style="padding:40px;">
                    <div style="text-align:center;margin-bottom:30px;">
                        <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background:#d1fae5;line-height:56px;font-size:28px;color:#059669;">✓</div>
                        <h2 style="margin:16px 0 4px;color:#111827;">Thank you, ${customerName}!</h2>
                        <p style="margin:0;color:#6b7280;">Your order has been placed successfully.</p>
                    </div>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                        <tr>
                            <td style="font-size:13px;color:#9ca3af;">Order Number</td>
                            <td style="font-size:13px;color:#9ca3af;text-align:right;">Status</td>
                        </tr>
                        <tr>
                            <td style="font-weight:bold;color:#111827;">#${orderNumber}</td>
                            <td style="text-align:right;">
                                <span style="background:#d1fae5;color:#059669;padding:4px 10px;border-radius:9999px;font-size:12px;font-weight:bold;">
                                    Payment Confirmed
                                </span>
                            </td>
                        </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
                        ${itemsHtml}
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
                        <tr>
                            <td style="padding-top:12px;font-weight:bold;color:#111827;">Total Paid</td>
                            <td style="padding-top:12px;text-align:right;font-weight:bold;color:#111827;font-size:18px;">
                                ${formatINR(totalAmount)}
                            </td>
                        </tr>
                    </table>

                    <hr style="margin:35px 0;border:none;border-top:1px solid #e5e7eb;">

                    <p style="margin:0;">
                        We're getting your order ready. You'll receive another email as soon as it ships, and you can always
                        track its progress from your account.
                    </p>

                    <p style="margin-top:16px;">
                        Thank you for shopping with <strong>Vintage Fashion</strong> — we hope you love what you picked!
                    </p>
                </td>
            </tr>

            <tr>
                <td align="center" style="background:#f9fafb;padding:25px;font-size:13px;color:#6b7280;">
                    © ${new Date().getFullYear()} Vintage Fashion. All Rights Reserved.
                    <br><br>
                    <span style="color:#9ca3af;">Please do not reply to automated emails.</span>
                </td>
            </tr>

        </table>
    </body>
    </html>
    `;

    const data = await resend.emails.send({
        from: "Vintage Fashion <onboarding@resend.dev>",
        to,
        subject: `Order Confirmed — #${orderNumber}`,
        html
    });

    console.log(data);
};