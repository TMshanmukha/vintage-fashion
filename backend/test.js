import dotenv from "dotenv";
dotenv.config();

import { sendResetPasswordEmail } from "./src/utils/mail.util.js";

await sendResetPasswordEmail({

    email: "shanmu547@gmail.com",

    resetId: 1,

    token: "abcdef123456"

});

console.log("Mail Sent");