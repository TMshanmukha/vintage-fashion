import resend from "../config/resend.js";

export const sendResetPasswordEmail = async ({
    email,
    resetId,
    token
}) => {

    const resetLink =
        `http://localhost:5173/reset-password?resetId=${resetId}&token=${token}`;

    const data = await resend.emails.send({

        from: "onboarding@resend.dev",

        to: email,

        subject: "Reset your password",

        html: `
            <h2>Reset Password</h2>

            <p>You requested a password reset.</p>

            <p>
                <a href="${resetLink}">
                    Click here to reset your password
                </a>
            </p>

            <p>This link expires in 15 minutes.</p>

            <p>If you didn't request this, ignore this email.</p>
        `
    });

    console.log(data);

};