import resend from "../config/resend.js";

const formatINR = (value) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value || 0);

export const sendWelcomeEmail = async ({ to, customerName }) => {
    const storeUrl = process.env.FRONTEND_URL || "https://vintage-fashion-xi.vercel.app";
    const name = customerName || "Fashion Enthusiast";

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0;padding:40px 0;background:#faf5f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#27272a;">
        <table align="center" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 32px rgba(0,0,0,.08);border:1px solid #fce7f3;max-width:92%;margin:0 auto;">
            <!-- Header -->
            <tr>
                <td align="center" style="background:linear-gradient(135deg, #18181b 0%, #27272a 100%);color:#ffffff;padding:45px 30px;">
                    <span style="display:inline-block;background:rgba(236,72,153,0.15);color:#f472b6;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:6px 14px;border-radius:20px;border:1px solid rgba(244,114,182,0.3);margin-bottom:12px;">
                        WELCOME TO THE FAMILY
                    </span>
                    <h1 style="margin:8px 0 0;font-size:32px;font-weight:800;letter-spacing:-0.5px;color:#ffffff;">
                        Vintage Fashion<span style="color:#ec4899;">.</span>
                    </h1>
                    <p style="margin:10px 0 0;color:#a1a1aa;font-size:14px;letter-spacing:1px;text-transform:uppercase;">
                        Timeless Aesthetics • Modern Elegance
                    </p>
                </td>
            </tr>

            <!-- Hero Intro -->
            <tr>
                <td style="padding:40px 40px 25px;">
                    <h2 style="margin:0 0 16px;color:#18181b;font-size:22px;font-weight:700;">
                        Hello, ${name} 👋
                    </h2>
                    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#52525b;">
                        We are absolutely thrilled to welcome you to <strong>Vintage Fashion</strong>! Your account is now active, opening doors to curated fashion pieces crafted with exquisite attention to detail and modern sustainability.
                    </p>

                    <!-- Features Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf2f8;border-radius:14px;border:1px solid #fbcfe8;margin:25px 0;padding:15px;">
                        <tr>
                            <td style="padding:12px 16px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td width="36" valign="top" style="font-size:20px;">✨</td>
                                        <td style="padding-left:10px;">
                                            <strong style="color:#18181b;font-size:14px;display:block;">Curated Collections</strong>
                                            <span style="color:#71717a;font-size:13px;line-height:1.5;">Hand-picked vintage & modern apparel suited for every occasion.</span>
                                        </td>
                                    </tr>
                                    <tr><td height="14" colspan="2"></td></tr>
                                    <tr>
                                        <td width="36" valign="top" style="font-size:20px;">🚚</td>
                                        <td style="padding-left:10px;">
                                            <strong style="color:#18181b;font-size:14px;display:block;">Fast & Secure Delivery</strong>
                                            <span style="color:#71717a;font-size:13px;line-height:1.5;">Reliable express dispatch with live tracking straight to your door.</span>
                                        </td>
                                    </tr>
                                    <tr><td height="14" colspan="2"></td></tr>
                                    <tr>
                                        <td width="36" valign="top" style="font-size:20px;">🔄</td>
                                        <td style="padding-left:10px;">
                                            <strong style="color:#18181b;font-size:14px;display:block;">Hassle-Free Returns</strong>
                                            <span style="color:#71717a;font-size:13px;line-height:1.5;">Easy 7-day return policy for a seamless shopping experience.</span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    <!-- CTA Button -->
                    <div align="center" style="margin:35px 0 20px;">
                        <a href="${storeUrl}/shop" target="_blank" style="display:inline-block;background:linear-gradient(135deg, #ec4899 0%, #db2777 100%);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:0.5px;padding:16px 36px;border-radius:12px;box-shadow:0 8px 20px rgba(236,72,153,0.35);">
                            Explore The Collection →
                        </a>
                    </div>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td align="center" style="background:#f4f4f5;padding:30px;font-size:12px;color:#71717a;border-top:1px solid #e4e4e7;">
                    <p style="margin:0 0 8px;font-weight:600;color:#27272a;">Vintage Fashion Boutique</p>
                    <p style="margin:0 0 14px;color:#71717a;">
                        Have questions or need styling advice? Reply directly to this email or visit our Help Center.
                    </p>
                    <p style="margin:0;color:#a1a1aa;">
                        © ${new Date().getFullYear()} Vintage Fashion. All Rights Reserved.
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

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

export const sendAdminEmail = async ({ to, subject, body, imageUrl }) => {
    const storeUrl = process.env.FRONTEND_URL || "https://vintage-fashion-xi.vercel.app";

    const bannerHtml = imageUrl ? `
            <tr>
                <td align="center" style="padding:0;background:#ffffff;">
                    <img src="${imageUrl}" alt="${subject}" style="width:100%;max-width:600px;max-height:340px;object-fit:cover;display:block;border-bottom:1px solid #f1f5f9;" />
                </td>
            </tr>
    ` : "";

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${subject}</title>
    </head>
    <body style="margin:0;padding:40px 12px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;-webkit-font-smoothing:antialiased;">
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
            <!-- Luxury Brand Header -->
            <tr>
                <td align="center" style="background:#0f172a;padding:36px 24px;border-bottom:3px solid #ec4899;">
                    <span style="display:inline-block;background:rgba(236,72,153,0.15);color:#f472b6;font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;padding:5px 14px;border-radius:20px;border:1px solid rgba(244,114,182,0.3);margin-bottom:12px;">
                        EXCLUSIVE NOTIFICATION
                    </span>
                    <h1 style="margin:6px 0 0;font-size:28px;font-weight:900;letter-spacing:-0.5px;color:#ffffff;">
                        VINTAGE FASHION<span style="color:#ec4899;">.</span>
                    </h1>
                    <p style="margin:8px 0 0;color:#94a3b8;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;font-weight:500;">
                        Curated Heritage &amp; Modern Luxury
                    </p>
                </td>
            </tr>

            ${bannerHtml}

            <!-- Main Body -->
            <tr>
                <td style="padding:36px 32px 28px;">
                    <h2 style="margin:0 0 18px;color:#0f172a;font-size:22px;font-weight:800;line-height:1.3;letter-spacing:-0.3px;">
                        ${subject}
                    </h2>

                    <div style="font-size:15px;line-height:1.8;color:#334155;background:#fafafa;padding:22px 24px;border-radius:14px;border-left:4px solid #ec4899;margin-bottom:28px;">
                        ${body.replace(/\n/g, "<br>")}
                    </div>

                    <!-- Call to Action -->
                    <div align="center" style="margin:32px 0 16px;">
                        <a href="${storeUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.5px;padding:15px 34px;border-radius:12px;box-shadow:0 6px 18px rgba(15,23,42,0.25);text-transform:uppercase;">
                            Shop Vintage Collection &rarr;
                        </a>
                    </div>

                    <!-- Trust Badges -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;padding-top:20px;border-top:1px dashed #e2e8f0;">
                        <tr>
                            <td align="center" style="font-size:12px;color:#64748b;line-height:1.5;">
                                <span style="display:inline-block;margin:4px 8px;">&#10022; <strong>100% Authentic Quality</strong></span>
                                <span style="display:inline-block;margin:4px 8px;">&#10022; <strong>Express Shipping</strong></span>
                                <span style="display:inline-block;margin:4px 8px;">&#10022; <strong>Dedicated Support</strong></span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- Luxury Footer -->
            <tr>
                <td align="center" style="background:#f8fafc;padding:28px 24px;font-size:12px;color:#64748b;border-top:1px solid #f1f5f9;line-height:1.6;">
                    <p style="margin:0 0 6px;font-weight:700;color:#1e293b;">
                        Vintage Fashion Boutique
                    </p>
                    <p style="margin:0 0 10px;">
                        <a href="${storeUrl}" target="_blank" style="color:#ec4899;text-decoration:none;font-weight:600;">https://vintage-fashion-xi.vercel.app</a>
                    </p>
                    <p style="margin:0 0 12px;color:#94a3b8;font-size:11px;">
                        This communication was dispatched directly from the Vintage Fashion Store Team.
                    </p>
                    <p style="margin:0;color:#cbd5e1;font-size:11px;">
                        &copy; ${new Date().getFullYear()} Vintage Fashion. All rights reserved.
                    </p>
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

    console.log("Admin email sent:", data);
    return data;
};

// Sent to the CUSTOMER right after a payment is verified successfully.
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

// Sent to the CUSTOMER once a Shiprocket shipment + AWB is created.
export const sendShipmentCreatedEmail = async ({ to, customerName, orderNumber, awbNumber, courierName }) => {

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
                        <div style="display:inline-block;width:56px;height:56px;border-radius:50%;background:#dbeafe;line-height:56px;font-size:28px;color:#2563eb;">📦</div>
                        <h2 style="margin:16px 0 4px;color:#111827;">Hi ${customerName}, it's on its way!</h2>
                        <p style="margin:0;color:#6b7280;">Order #${orderNumber} has been handed to the courier.</p>
                    </div>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
                        <tr>
                            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#9ca3af;font-size:13px;">Courier</td>
                            <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:bold;color:#111827;">${courierName}</td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0;color:#9ca3af;font-size:13px;">Tracking / AWB Number</td>
                            <td style="padding:10px 0;text-align:right;font-weight:bold;color:#111827;">${awbNumber}</td>
                        </tr>
                    </table>

                    <hr style="margin:35px 0;border:none;border-top:1px solid #e5e7eb;">

                    <p style="margin:0;">
                        You can track your order's progress anytime from your account's Orders page.
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
        subject: `Your order #${orderNumber} has shipped`,
        html
    });

    console.log(data);
};