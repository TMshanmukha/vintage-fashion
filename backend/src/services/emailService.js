import resend from "../config/resend.js";

// Keep your existing sendResetPasswordEmail in this same file —
// both functions share the one resend client from config/resend.js.

export const sendAdminEmail = async ({ to, subject, body }) => {

    const data = await resend.emails.send({

        from: "onboarding@resend.dev",

        to,

        subject,

        html: `<p>${body.replace(/\n/g, "<br/>")}</p>`
    });

    console.log(data);
};
