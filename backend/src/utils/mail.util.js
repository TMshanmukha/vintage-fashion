import resend from "../config/resend.js";

export const sendResetPasswordEmail = async ({
    email,
    resetId,
    token
}) => {
    const frontendUrl = (!process.env.FRONTEND_URL || process.env.FRONTEND_URL.includes("localhost"))
        ? "https://vintage-fashion-xi.vercel.app"
        : process.env.FRONTEND_URL;
    const resetLink = `${frontendUrl}/reset-password?resetId=${resetId}&token=${token}`;

    const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:30px 10px;background-color:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#1e293b;">
    <center>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(0,0,0,0.06);">
            
            <!-- Luxury Header -->
            <tr>
                <td align="center" style="background-color:#0f172a;padding:34px 24px;border-bottom:3px solid #ec4899;">
                    <span style="display:inline-block;background-color:rgba(236,72,153,0.18);color:#f472b6;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;padding:5px 14px;border-radius:20px;border:1px solid rgba(244,114,182,0.35);margin-bottom:10px;">
                        ACCOUNT SECURITY
                    </span>
                    <h1 style="margin:6px 0 0;font-size:27px;font-weight:900;letter-spacing:-0.5px;color:#ffffff;line-height:1.2;">
                        VINTAGE FASHION<span style="color:#ec4899;">.</span>
                    </h1>
                </td>
            </tr>

            <!-- Content -->
            <tr>
                <td style="padding:34px 30px 24px;background-color:#ffffff;">
                    <h2 style="margin:0 0 14px;color:#0f172a;font-size:22px;font-weight:800;">
                        Password Reset Request 🔐
                    </h2>
                    <p style="margin:0 0 18px;font-size:15px;line-height:1.75;color:#475569;">
                        We received a request to reset the password for your Vintage Fashion account (<strong>${email}</strong>). Click the secure button below to set a new password.
                    </p>

                    <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin:28px auto 14px;">
                        <tr>
                            <td align="center" style="border-radius:12px;background-color:#0f172a;box-shadow:0 6px 18px rgba(15,23,42,0.2);">
                                <a href="${resetLink}" target="_blank" style="display:inline-block;padding:15px 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:#ffffff !important;text-decoration:none;font-weight:700;letter-spacing:0.5px;border-radius:12px;text-transform:uppercase;">
                                    Reset Password &rarr;
                                </a>
                            </td>
                        </tr>
                    </table>

                    <div style="background-color:#fef2f2;border-radius:12px;border:1px solid #fecaca;padding:14px 16px;margin:24px 0 10px;">
                        <p style="margin:0;font-size:12px;color:#991b1b;line-height:1.5;">
                            ⏰ <strong>Security Notice:</strong> This reset link is active for <strong>15 minutes</strong>. If you did not request this password change, you can safely disregard this email.
                        </p>
                    </div>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td align="center" style="background-color:#f8fafc;padding:24px;font-size:12px;color:#64748b;border-top:1px solid #f1f5f9;line-height:1.6;">
                    <p style="margin:0 0 4px;font-weight:700;color:#1e293b;">
                        Vintage Fashion Security Team
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

    const data = await resend.emails.send({
        from: "Vintage Fashion <onboarding@resend.dev>",
        to: email,
        subject: "Reset your Vintage Fashion password 🔐",
        html
    });

    console.log("Password reset email sent:", data);
    return data;
};