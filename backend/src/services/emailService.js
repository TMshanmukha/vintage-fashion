import resend from "../config/resend.js";

const formatINR = (value) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value || 0);

const STORE_URL = process.env.FRONTEND_URL || "https://vintage-fashion-xi.vercel.app";

/**
 * Bulletproof Mobile-First Email Template Shell
 * Compatible with Gmail (Web, iOS, Android), Apple Mail, Outlook (Web & Desktop), Yahoo Mail
 */
const buildEmailTemplate = ({
    badge = "OFFICIAL UPDATE",
    bannerImageUrl = null,
    subjectTitle = "Vintage Fashion Update",
    contentHtml = "",
    ctaButtonText = "Shop Vintage Collection",
    ctaButtonUrl = STORE_URL,
    footerNote = "You are receiving this official communication as a valued patron of Vintage Fashion."
}) => {
    // Sanitize image URL to guarantee https://
    let cleanBannerUrl = bannerImageUrl;
    if (cleanBannerUrl && typeof cleanBannerUrl === "string") {
        cleanBannerUrl = cleanBannerUrl.trim();
        if (cleanBannerUrl.startsWith("http://")) {
            cleanBannerUrl = cleanBannerUrl.replace("http://", "https://");
        }
    } else {
        cleanBannerUrl = null;
    }

    const bannerSection = cleanBannerUrl ? `
        <!-- Full-Width Responsive Banner Image -->
        <tr>
            <td align="center" style="padding:0;margin:0;background-color:#0f172a;line-height:0;font-size:0;">
                <img src="${cleanBannerUrl}" alt="${subjectTitle}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;" />
            </td>
        </tr>
    ` : "";

    const ctaSection = ctaButtonText && ctaButtonUrl ? `
        <!-- Bulletproof CTA Button -->
        <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin:28px auto 12px;">
            <tr>
                <td align="center" style="border-radius:12px;background-color:#0f172a;box-shadow:0 6px 18px rgba(15,23,42,0.18);">
                    <a href="${ctaButtonUrl}" target="_blank" style="display:inline-block;padding:15px 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:#ffffff !important;text-decoration:none;font-weight:700;letter-spacing:0.5px;border-radius:12px;text-transform:uppercase;">
                        ${ctaButtonText} &rarr;
                    </a>
                </td>
            </tr>
        </table>
    ` : "";

    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${subjectTitle}</title>
    <!--[if mso]>
    <style type="text/css">
        table {border-collapse:collapse;border-spacing:0;margin:0;}
        div, p, a, li, td {font-family: Arial, sans-serif !important;}
    </style>
    <![endif]-->
    <style type="text/css">
        @media only screen and (max-width: 600px) {
            .mobile-container {
                width: 100% !important;
                max-width: 100% !important;
                border-radius: 0 !important;
                border: none !important;
            }
            .mobile-content {
                padding: 24px 18px !important;
            }
            .mobile-header {
                padding: 26px 16px !important;
            }
            .mobile-title {
                font-size: 20px !important;
                line-height: 1.3 !important;
                margin-bottom: 14px !important;
            }
            .mobile-paragraph {
                font-size: 14px !important;
                line-height: 1.7 !important;
                margin-bottom: 14px !important;
            }
            .mobile-btn {
                display: block !important;
                width: 100% !important;
                padding: 14px 18px !important;
                box-sizing: border-box !important;
                text-align: center !important;
            }
        }
    </style>
</head>
<body style="margin:0;padding:20px 0;background-color:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#1e293b;">
    <center>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mobile-container" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(0,0,0,0.06);">
            
            <!-- Luxury Obsidian Header -->
            <tr>
                <td align="center" class="mobile-header" style="background-color:#0f172a;padding:34px 24px;border-bottom:3px solid #ec4899;">
                    <table border="0" cellpadding="0" cellspacing="0" align="center">
                        <tr>
                            <td align="center">
                                <span style="display:inline-block;background-color:rgba(236,72,153,0.18);color:#f472b6;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;padding:5px 14px;border-radius:20px;border:1px solid rgba(244,114,182,0.35);margin-bottom:10px;">
                                    ${badge}
                                </span>
                                <h1 style="margin:6px 0 0;font-size:27px;font-weight:900;letter-spacing:-0.5px;color:#ffffff;line-height:1.2;">
                                    VINTAGE FASHION<span style="color:#ec4899;">.</span>
                                </h1>
                                <p style="margin:6px 0 0;color:#94a3b8;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:500;">
                                    Curated Heritage &amp; Contemporary Luxury
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            ${bannerSection}

            <!-- Main Body Content -->
            <tr>
                <td class="mobile-content" style="padding:34px 30px 24px;background-color:#ffffff;">
                    ${contentHtml}
                    ${ctaSection}

                    <!-- Trust Bar -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:28px;padding-top:18px;border-top:1px dashed #e2e8f0;">
                        <tr>
                            <td align="center" style="font-size:12px;color:#64748b;line-height:1.6;">
                                <span style="display:inline-block;margin:3px 8px;">&#10022; <strong>100% Authentic Quality</strong></span>
                                <span style="display:inline-block;margin:3px 8px;">&#10022; <strong>Pan-India Express Delivery</strong></span>
                                <span style="display:inline-block;margin:3px 8px;">&#10022; <strong>Dedicated Support</strong></span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- Luxury Footer -->
            <tr>
                <td align="center" style="background-color:#f8fafc;padding:26px 24px;font-size:12px;color:#64748b;border-top:1px solid #f1f5f9;line-height:1.6;">
                    <p style="margin:0 0 6px;font-weight:700;color:#1e293b;font-size:13px;">
                        Vintage Fashion Boutique
                    </p>
                    <p style="margin:0 0 10px;">
                        <a href="${STORE_URL}" target="_blank" style="color:#ec4899;text-decoration:none;font-weight:600;">${STORE_URL}</a>
                    </p>
                    <p style="margin:0 0 10px;color:#94a3b8;font-size:11px;">
                        ${footerNote}
                    </p>
                    <p style="margin:0;color:#cbd5e1;font-size:11px;">
                        &copy; ${new Date().getFullYear()} Vintage Fashion. All rights reserved.
                    </p>
                </td>
            </tr>

        </table>
    </center>
</body>
</html>`;
};

const formatEmailBody = (rawBody) => {
    if (!rawBody) return "";

    const paragraphs = rawBody.split(/\r?\n\r?\n/);

    return paragraphs.map(p => {
        const trimmed = p.trim();
        if (!trimmed) return "";

        return `<p class="mobile-paragraph" style="margin:0 0 16px;font-size:15px;line-height:1.75;color:#334155;letter-spacing:0.2px;">${trimmed.replace(/\r?\n/g, "<br>")}</p>`;
    }).join("");
};

// 1. Welcome Email (Dispatched after new user registration)
export const sendWelcomeEmail = async ({ to, customerName }) => {
    const name = customerName || "Gentleman";
    const subject = `Welcome to Vintage Fashion, ${name}! ✨`;

    const contentHtml = `
        <h2 class="mobile-title" style="margin:0 0 16px;color:#0f172a;font-size:22px;font-weight:800;letter-spacing:-0.3px;line-height:1.3;">
            Welcome to the Club, ${name} 👋
        </h2>
        <p class="mobile-paragraph" style="margin:0 0 20px;font-size:15px;line-height:1.75;color:#475569;">
            We are thrilled to welcome you to <strong>Vintage Fashion</strong>! Your account is active, giving you exclusive access to hand-curated vintage apparel, tailored menswear, and limited-edition drops.
        </p>

        <!-- Perks Box -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#fdf2f8;border-radius:14px;border:1px solid #fbcfe8;margin:20px 0;padding:16px;">
            <tr>
                <td style="padding:10px 14px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td width="30" valign="top" style="font-size:18px;">👔</td>
                            <td style="padding-left:12px;">
                                <strong style="color:#0f172a;font-size:14px;display:block;">Curated Men's Vintage</strong>
                                <span style="color:#64748b;font-size:13px;line-height:1.5;">Hand-tailored blazers, Cuban shirts, selvage denim, jackets, and royal kurtas.</span>
                            </td>
                        </tr>
                        <tr><td height="12" colspan="2"></td></tr>
                        <tr>
                            <td width="30" valign="top" style="font-size:18px;">🚚</td>
                            <td style="padding-left:12px;">
                                <strong style="color:#0f172a;font-size:14px;display:block;">Fast &amp; Secure Delivery</strong>
                                <span style="color:#64748b;font-size:13px;line-height:1.5;">Express Pan-India shipping with real-time tracking straight to your doorstep.</span>
                            </td>
                        </tr>
                        <tr><td height="12" colspan="2"></td></tr>
                        <tr>
                            <td width="30" valign="top" style="font-size:18px;">✨</td>
                            <td style="padding-left:12px;">
                                <strong style="color:#0f172a;font-size:14px;display:block;">Exclusive Member Perks</strong>
                                <span style="color:#64748b;font-size:13px;line-height:1.5;">First access to seasonal drops, flash sales, and early catalog releases.</span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    `;

    const html = buildEmailTemplate({
        badge: "WELCOME TO THE FAMILY",
        subjectTitle: subject,
        contentHtml,
        ctaButtonText: "Explore The Collection",
        ctaButtonUrl: `${STORE_URL}/shop`,
        footerNote: "Need sizing advice or styling assistance? Reply directly to this email anytime."
    });

    try {
        const data = await resend.emails.send({
            from: "Vintage Fashion <onboarding@resend.dev>",
            to,
            subject,
            html
        });
        console.log("Welcome email sent:", data);
        return data;
    } catch (err) {
        console.error("Failed to send welcome email:", err.message);
    }
};

// 2. Admin Promotional & Broadcast Email (Dynamic Name & Photo Support)
export const sendAdminEmail = async ({ to, customerName, subject, body, imageUrl }) => {
    // Determine friendly fallback name
    let recipientName = "Gentleman";
    if (customerName && typeof customerName === "string" && customerName.trim()) {
        recipientName = customerName.trim();
    } else if (to && typeof to === "string") {
        const usernamePart = to.split("@")[0].replace(/[._-]/g, " ");
        recipientName = usernamePart.charAt(0).toUpperCase() + usernamePart.slice(1);
    }

    // Dynamic token replacement for {name}, {{name}}, {Name}, [name], etc.
    const nameTokenRegex = /\{\{\s*(name|userName|customerName|user)\s*\}\}|\{\s*(name|userName|customerName|user)\s*\}|\[\s*(name|user\s*name|customer\s*name)\s*\]/gi;

    let personalizedSubject = subject ? subject.replace(nameTokenRegex, recipientName) : "Vintage Fashion Update";
    let personalizedBody = body ? body.replace(nameTokenRegex, recipientName) : "";

    // If body still does not have a greeting and didn't have name token, add greeting
    const trimmed = personalizedBody.trim();
    const startsWithGreeting = /^(Dear|Hello|Hi|Hey|Greetings|Namaste)\b/i.test(trimmed);
    if (!startsWithGreeting && !nameTokenRegex.test(body || "")) {
        personalizedBody = `Dear ${recipientName},\n\n${personalizedBody}`;
    }

    const formattedContent = formatEmailBody(personalizedBody);

    const contentHtml = `
        <h2 class="mobile-title" style="margin:0 0 18px;color:#0f172a;font-size:22px;font-weight:800;line-height:1.35;letter-spacing:-0.3px;">
            ${personalizedSubject}
        </h2>

        <div style="margin-bottom:10px;">
            ${formattedContent}
        </div>
    `;

    const html = buildEmailTemplate({
        badge: "OFFICIAL ANNOUNCEMENT",
        bannerImageUrl: imageUrl || null,
        subjectTitle: personalizedSubject,
        contentHtml,
        ctaButtonText: "Shop Vintage Collection",
        ctaButtonUrl: STORE_URL,
        footerNote: `This official communication was personally addressed to ${recipientName}.`
    });

    try {
        const data = await resend.emails.send({
            from: "Vintage Fashion <onboarding@resend.dev>",
            to,
            subject: personalizedSubject,
            html
        });
        console.log(`Admin email dispatched to ${to} (${recipientName}):`, data);
        return data;
    } catch (err) {
        console.error(`Failed to send admin email to ${to}:`, err.message);
        throw err;
    }
};

// 3. Order Confirmation & Payment Receipt
export const sendOrderConfirmationEmail = async ({
    to,
    customerName,
    orderNumber,
    items = [],
    subtotal = 0,
    discountAmount = 0,
    shippingFee = 0,
    deliveryMethod = "COURIER",
    totalAmount,
}) => {
    const name = customerName || "Valued Customer";
    const subject = `Order Confirmed — #${orderNumber} ✨`;

    const itemsRows = items.map((item) => `
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

    const isLocal = deliveryMethod === "LOCAL";
    const deliveryMethodLabel = isLocal ? "🛵 Local Delivery (Anantapur Store)" : "🚚 Express Courier Delivery";
    const footerNoteText = isLocal
        ? "Our Anantapur team is preparing your package and will personally deliver it to your address."
        : "We are carefully packaging your curated vintage pieces and will email you as soon as the courier tracking AWB is assigned.";

    const contentHtml = `
        <div style="text-align:center;margin-bottom:20px;">
            <div style="display:inline-block;width:52px;height:52px;border-radius:50%;background-color:#ecfdf5;line-height:52px;font-size:24px;color:#059669;margin-bottom:10px;">✓</div>
            <h2 class="mobile-title" style="margin:0 0 6px;color:#0f172a;font-size:22px;font-weight:800;">Thank you for your order, ${name}!</h2>
            <p style="margin:0;color:#64748b;font-size:14px;">Your payment has been successfully verified.</p>
        </div>

        <!-- Order Summary Pill -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;margin:18px 0;padding:14px;">
            <tr>
                <td style="padding:8px 12px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td>
                                <span style="font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;display:block;">Order ID</span>
                                <strong style="font-size:16px;color:#0f172a;">#${orderNumber}</strong>
                            </td>
                            <td align="right">
                                <span style="display:inline-block;background-color:#ecfdf5;color:#059669;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;border:1px solid #a7f3d0;">
                                    Payment Confirmed
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding-top:10px;border-top:1px dashed #e2e8f0;margin-top:10px;">
                                <span style="font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;display:block;">Delivery Method</span>
                                <strong style="font-size:13px;color:#0f172a;">${deliveryMethodLabel}</strong>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <!-- Itemized List -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0;">
            <thead>
                <tr>
                    <th align="left" style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;padding-bottom:10px;border-bottom:1px solid #e2e8f0;">Item</th>
                    <th align="right" style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;padding-bottom:10px;border-bottom:1px solid #e2e8f0;">Price</th>
                </tr>
            </thead>
            <tbody>
                ${itemsRows}
            </tbody>
        </table>

        <!-- Price Breakdown -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:14px 0;padding-top:10px;border-top:1px solid #f1f5f9;">
            ${Number(subtotal) > 0 ? `
            <tr>
                <td style="font-size:13px;color:#64748b;padding:4px 0;">Subtotal</td>
                <td align="right" style="font-size:13px;font-weight:600;color:#0f172a;padding:4px 0;">${formatINR(subtotal)}</td>
            </tr>` : ""}
            ${Number(discountAmount) > 0 ? `
            <tr>
                <td style="font-size:13px;color:#059669;padding:4px 0;">Discount Savings</td>
                <td align="right" style="font-size:13px;font-weight:700;color:#059669;padding:4px 0;">- ${formatINR(discountAmount)}</td>
            </tr>` : ""}
            <tr>
                <td style="font-size:13px;color:#64748b;padding:4px 0;">Shipping (${isLocal ? "Local Delivery" : "Courier"})</td>
                <td align="right" style="font-size:13px;font-weight:600;color:#0f172a;padding:4px 0;">
                    ${Number(shippingFee) === 0 ? '<span style="color:#059669;font-weight:700;">FREE</span>' : formatINR(shippingFee)}
                </td>
            </tr>
            <tr>
                <td style="font-size:15px;font-weight:800;color:#0f172a;padding-top:10px;border-top:1px dashed #e2e8f0;">Total Amount Paid</td>
                <td align="right" style="font-size:18px;font-weight:900;color:#ec4899;padding-top:10px;border-top:1px dashed #e2e8f0;">
                    ${formatINR(totalAmount)}
                </td>
            </tr>
        </table>
    `;

    const html = buildEmailTemplate({
        badge: "ORDER CONFIRMED",
        subjectTitle: subject,
        contentHtml,
        ctaButtonText: "View Order Status",
        ctaButtonUrl: `${STORE_URL}/my-account`,
        footerNote: footerNoteText,
    });

    try {
        const data = await resend.emails.send({
            from: "Vintage Fashion <onboarding@resend.dev>",
            to,
            subject,
            html
        });
        console.log("Order confirmation email sent:", data);
        return data;
    } catch (err) {
        console.error("Failed to send order confirmation email:", err.message);
    }
};

// 4. Shipment & Live Courier Tracking Notification
export const sendShipmentCreatedEmail = async ({ to, customerName, orderNumber, awbNumber, courierName }) => {
    const name = customerName || "Customer";
    const subject = `Your order #${orderNumber} has shipped! 🚚`;

    const contentHtml = `
        <div style="text-align:center;margin-bottom:20px;">
            <div style="display:inline-block;width:52px;height:52px;border-radius:50%;background-color:#eff6ff;line-height:52px;font-size:24px;color:#2563eb;margin-bottom:10px;">📦</div>
            <h2 class="mobile-title" style="margin:0 0 6px;color:#0f172a;font-size:22px;font-weight:800;">Hi ${name}, your order has shipped!</h2>
            <p style="margin:0;color:#64748b;font-size:14px;">Order #${orderNumber} has been handed over to the courier partner.</p>
        </div>

        <!-- Tracking Card -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8fafc;border-radius:14px;border:1px solid #e2e8f0;margin:18px 0;padding:14px;">
            <tr>
                <td style="padding:10px 12px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                            <td style="padding-bottom:10px;border-bottom:1px solid #f1f5f9;">
                                <span style="font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;display:block;">Courier Partner</span>
                                <strong style="font-size:14px;color:#0f172a;">${courierName || "Express Courier"}</strong>
                            </td>
                            <td align="right" style="padding-bottom:10px;border-bottom:1px solid #f1f5f9;">
                                <span style="display:inline-block;background-color:#eff6ff;color:#2563eb;font-size:11px;font-weight:700;padding:4px 12px;border-radius:20px;border:1px solid #bfdbfe;">
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
    `;

    const html = buildEmailTemplate({
        badge: "SHIPMENT DISPATCHED",
        subjectTitle: subject,
        contentHtml,
        ctaButtonText: "Track Live Shipment",
        ctaButtonUrl: `${STORE_URL}/my-account`,
        footerNote: "You can track real-time delivery status anytime by visiting your Orders account page."
    });

    try {
        const data = await resend.emails.send({
            from: "Vintage Fashion <onboarding@resend.dev>",
            to,
            subject,
            html
        });
        console.log("Shipment created email sent:", data);
        return data;
    } catch (err) {
        console.error("Failed to send shipment email:", err.message);
    }
};