import resend from "../config/resend.js";

const formatINR = (value) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value || 0);

const STORE_URL = process.env.FRONTEND_URL || "https://vintage-fashion-xi.vercel.app";

// Reusable Luxury Email Base Wrapper
const renderEmailLayout = ({ previewText = "", headerTag = "OFFICIAL UPDATE", contentHtml, footerExtra = "" }) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vintage Fashion</title>
</head>
<body style="margin:0;padding:40px 12px;background:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;-webkit-font-smoothing:antialiased;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
        
        <!-- Header -->
        <tr>
            <td align="center" style="background:#0f172a;padding:36px 24px;border-bottom:3px solid #ec4899;">
                <span style="display:inline-block;background:rgba(236,72,153,0.15);color:#f472b6;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;padding:5px 14px;border-radius:20px;border:1px solid rgba(244,114,182,0.3);margin-bottom:12px;">
                    ${headerTag}
                </span>
                <h1 style="margin:6px 0 0;font-size:28px;font-weight:900;letter-spacing:-0.5px;color:#ffffff;">
                    VINTAGE FASHION<span style="color:#ec4899;">.</span>
                </h1>
                <p style="margin:8px 0 0;color:#94a3b8;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;font-weight:500;">
                    Curated Heritage &amp; Modern Elegance
                </p>
            </td>
        </tr>

        <!-- Body Content -->
        <tr>
            <td style="padding:36px 32px 28px;">
                ${contentHtml}

                <!-- Trust Badges -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;padding-top:20px;border-top:1px dashed #e2e8f0;">
                    <tr>
                        <td align="center" style="font-size:12px;color:#64748b;line-height:1.6;">
                            <span style="display:inline-block;margin:4px 8px;">✦ <strong>100% Authentic Quality</strong></span>
                            <span style="display:inline-block;margin:4px 8px;">✦ <strong>Pan-India Express Dispatch</strong></span>
                            <span style="display:inline-block;margin:4px 8px;">✦ <strong>Dedicated Support</strong></span>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td align="center" style="background:#f8fafc;padding:28px 24px;font-size:12px;color:#64748b;border-top:1px solid #f1f5f9;line-height:1.6;">
                <p style="margin:0 0 6px;font-weight:700;color:#1e293b;">
                    Vintage Fashion Boutique
                </p>
                <p style="margin:0 0 10px;">
                    <a href="${STORE_URL}" target="_blank" style="color:#ec4899;text-decoration:none;font-weight:600;">${STORE_URL}</a>
                </p>
                ${footerExtra ? `<p style="margin:0 0 10px;color:#94a3b8;font-size:11px;">${footerExtra}</p>` : ""}
                <p style="margin:0;color:#cbd5e1;font-size:11px;">
                    &copy; ${new Date().getFullYear()} Vintage Fashion. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// 1. Welcome Email
export const sendWelcomeEmail = async ({ to, customerName }) => {
    const name = customerName || "Gentleman";

    const contentHtml = `
        <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:800;letter-spacing:-0.3px;">
            Welcome to the Club, ${name} 👋
        </h2>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.75;color:#475569;">
            We are absolutely thrilled to welcome you to <strong>Vintage Fashion</strong>! Your account is active, giving you premier access to hand-curated vintage apparel, tailored fits, and timeless menswear.
        </p>

        <!-- Perks Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-radius:14px;border:1px solid #f1f5f9;margin:24px 0;padding:16px;">
            <tr>
                <td style="padding:10px 14px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td width="32" valign="top" style="font-size:18px;">👔</td>
                            <td style="padding-left:12px;">
                                <strong style="color:#0f172a;font-size:14px;display:block;">Curated Men's Vintage</strong>
                                <span style="color:#64748b;font-size:13px;line-height:1.5;">Hand-tailored blazers, Cuban collar shirts, retro denim, and heritage kurtas.</span>
                            </td>
                        </tr>
                        <tr><td height="12" colspan="2"></td></tr>
                        <tr>
                            <td width="32" valign="top" style="font-size:18px;">🚚</td>
                            <td style="padding-left:12px;">
                                <strong style="color:#0f172a;font-size:14px;display:block;">Fast &amp; Secure Delivery</strong>
                                <span style="color:#64748b;font-size:13px;line-height:1.5;">Express dispatch with live tracking and doorstep delivery.</span>
                            </td>
                        </tr>
                        <tr><td height="12" colspan="2"></td></tr>
                        <tr>
                            <td width="32" valign="top" style="font-size:18px;">✨</td>
                            <td style="padding-left:12px;">
                                <strong style="color:#0f172a;font-size:14px;display:block;">Exclusive Member Drops</strong>
                                <span style="color:#64748b;font-size:13px;line-height:1.5;">First access to limited-edition drops and VIP reward codes.</span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- CTA Button -->
        <div align="center" style="margin:30px 0 15px;">
            <a href="${STORE_URL}/shop" target="_blank" style="display:inline-block;background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.5px;padding:15px 36px;border-radius:12px;box-shadow:0 8px 20px rgba(15,23,42,0.2);text-transform:uppercase;">
                Explore The Collection &rarr;
            </a>
        </div>
    `;

    const html = renderEmailLayout({
        headerTag: "WELCOME TO THE FAMILY",
        contentHtml,
        footerExtra: "Have questions or need sizing assistance? Reply directly to this email anytime."
    });

    try {
        const data = await resend.emails.send({
            from: "Vintage Fashion <onboarding@resend.dev>",
            to,
            subject: `Welcome to Vintage Fashion, ${name}! ✨`,
            html
        });
        console.log("Welcome email sent:", data);
        return data;
    } catch (err) {
        console.error("Failed to send welcome email:", err.message);
    }
};

// 2. Admin Broadcast & Custom Marketing Email
export const sendAdminEmail = async ({ to, subject, body, imageUrl }) => {
    const bannerHtml = imageUrl ? `
        <div style="margin:-12px -12px 24px -12px;border-radius:14px;overflow:hidden;border:1px solid #f1f5f9;background:#f8fafc;">
            <img src="${imageUrl}" alt="${subject}" style="width:100%;max-height:320px;object-fit:cover;display:block;" />
        </div>
    ` : "";

    const contentHtml = `
        ${bannerHtml}
        <h2 style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:800;line-height:1.3;letter-spacing:-0.3px;">
            ${subject}
        </h2>

        <div style="font-size:15px;line-height:1.8;color:#334155;background:#fafafa;padding:22px 24px;border-radius:14px;border-left:4px solid #ec4899;margin-bottom:28px;">
            ${body.replace(/\n/g, "<br>")}
        </div>

        <div align="center" style="margin:30px 0 15px;">
            <a href="${STORE_URL}" target="_blank" style="display:inline-block;background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.5px;padding:15px 36px;border-radius:12px;box-shadow:0 8px 20px rgba(15,23,42,0.2);text-transform:uppercase;">
                Shop Vintage Collection &rarr;
            </a>
        </div>
    `;

    const html = renderEmailLayout({
        headerTag: "EXCLUSIVE UPDATE",
        contentHtml,
        footerExtra: "This official communication was dispatched directly by the Vintage Fashion Team."
    });

    const data = await resend.emails.send({
        from: "Vintage Fashion <onboarding@resend.dev>",
        to,
        subject,
        html
    });

    console.log("Admin email sent:", data);
    return data;
};

// 3. Order Confirmation & Payment Verified Receipt
export const sendOrderConfirmationEmail = async ({ to, customerName, orderNumber, items = [], totalAmount }) => {
    const name = customerName || "Customer";

    const itemsHtml = items.map((item) => `
        <tr>
            <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;">
                <strong style="color:#0f172a;font-size:14px;display:block;">${item.product_name}</strong>
                <span style="color:#64748b;font-size:12px;margin-top:2px;display:block;">
                    ${[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(" · ")} · Qty: <strong>${item.quantity}</strong>
                </span>
            </td>
            <td style="padding:12px 0;border-bottom:1px solid #f1f5f9;text-align:right;white-space:nowrap;font-weight:700;color:#0f172a;font-size:14px;">
                ${formatINR(item.total_price)}
            </td>
        </tr>
    `).join("");

    const contentHtml = `
        <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;width:52px;height:52px;border-radius:50%;background:#ecfdf5;line-height:52px;font-size:24px;color:#059669;margin-bottom:12px;">✓</div>
            <h2 style="margin:0 0 6px;color:#0f172a;font-size:22px;font-weight:800;">Thank you for your order, ${name}!</h2>
            <p style="margin:0;color:#64748b;font-size:14px;">Your payment has been successfully verified.</p>
        </div>

        <!-- Order Summary Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;margin:20px 0;padding:16px;">
            <tr>
                <td style="padding:10px 14px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td>
                                <span style="font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;display:block;">Order Number</span>
                                <strong style="font-size:16px;color:#0f172a;">#${orderNumber}</strong>
                            </td>
                            <td align="right">
                                <span style="display:inline-block;background:#ecfdf5;color:#059669;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;border:1px solid #a7f3d0;">
                                    Payment Confirmed
                                </span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Items Table -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
            <thead>
                <tr>
                    <th align="left" style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;padding-bottom:10px;border-bottom:1px solid #e2e8f0;">Item</th>
                    <th align="right" style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;padding-bottom:10px;border-bottom:1px solid #e2e8f0;">Price</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>

        <!-- Total Breakdown -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;padding-top:10px;">
            <tr>
                <td style="font-size:15px;font-weight:800;color:#0f172a;">Total Amount Paid</td>
                <td align="right" style="font-size:18px;font-weight:900;color:#ec4899;">
                    ${formatINR(totalAmount)}
                </td>
            </tr>
        </table>

        <div align="center" style="margin:30px 0 15px;">
            <a href="${STORE_URL}/my-account" target="_blank" style="display:inline-block;background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.5px;padding:15px 36px;border-radius:12px;box-shadow:0 8px 20px rgba(15,23,42,0.2);text-transform:uppercase;">
                View Order Status &rarr;
            </a>
        </div>
    `;

    const html = renderEmailLayout({
        headerTag: "ORDER CONFIRMED",
        contentHtml,
        footerExtra: "We are carefully packaging your curated vintage pieces and will email you as soon as your parcel is dispatched."
    });

    try {
        const data = await resend.emails.send({
            from: "Vintage Fashion <onboarding@resend.dev>",
            to,
            subject: `Order Confirmed — #${orderNumber} ✨`,
            html
        });
        console.log("Order confirmation email sent:", data);
        return data;
    } catch (err) {
        console.error("Failed to send order confirmation email:", err.message);
    }
};

// 4. Shipment Dispatch & Live AWB Tracking Notification
export const sendShipmentCreatedEmail = async ({ to, customerName, orderNumber, awbNumber, courierName }) => {
    const name = customerName || "Customer";

    const contentHtml = `
        <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;width:52px;height:52px;border-radius:50%;background:#eff6ff;line-height:52px;font-size:24px;color:#2563eb;margin-bottom:12px;">📦</div>
            <h2 style="margin:0 0 6px;color:#0f172a;font-size:22px;font-weight:800;">Hi ${name}, your order has shipped!</h2>
            <p style="margin:0;color:#64748b;font-size:14px;">Order #${orderNumber} is now on its way to you.</p>
        </div>

        <!-- Tracking Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;margin:20px 0;padding:16px;">
            <tr>
                <td style="padding:12px 14px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="padding-bottom:10px;border-bottom:1px solid #f1f5f9;">
                                <span style="font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;display:block;">Courier Partner</span>
                                <strong style="font-size:14px;color:#0f172a;">${courierName || "Express Courier"}</strong>
                            </td>
                            <td align="right" style="padding-bottom:10px;border-bottom:1px solid #f1f5f9;">
                                <span style="display:inline-block;background:#eff6ff;color:#2563eb;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;border:1px solid #bfdbfe;">
                                    In Transit
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding-top:10px;">
                                <span style="font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;display:block;">Tracking / AWB Number</span>
                                <strong style="font-size:15px;color:#0f172a;letter-spacing:0.5px;">${awbNumber}</strong>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <div align="center" style="margin:30px 0 15px;">
            <a href="${STORE_URL}/my-account" target="_blank" style="display:inline-block;background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.5px;padding:15px 36px;border-radius:12px;box-shadow:0 8px 20px rgba(15,23,42,0.2);text-transform:uppercase;">
                Track Live Shipment &rarr;
            </a>
        </div>
    `;

    const html = renderEmailLayout({
        headerTag: "SHIPMENT DISPATCHED",
        contentHtml,
        footerExtra: "You can track real-time delivery status anytime by visiting your Orders dashboard."
    });

    try {
        const data = await resend.emails.send({
            from: "Vintage Fashion <onboarding@resend.dev>",
            to,
            subject: `Your order #${orderNumber} has shipped! 🚚`,
            html
        });
        console.log("Shipment created email sent:", data);
        return data;
    } catch (err) {
        console.error("Failed to send shipment email:", err.message);
    }
};