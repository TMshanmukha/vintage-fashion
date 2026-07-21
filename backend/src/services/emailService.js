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