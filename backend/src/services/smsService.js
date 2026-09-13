import dotenv from "dotenv";
import resend from "../config/resend.js";
dotenv.config();

const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || "Vintage Fashion <contact@vintagefashion.in>";

/**
 * Send 6-Digit SMS OTP Verification Code to Mobile Number
 * Supports Fast2SMS, 2Factor, Twilio, Resend Email fallback, or Preview Mode.
 */
export const sendVerificationOtpSms = async ({ phone, name, otp, email }) => {
  const cleanPhone = String(phone).trim().replace(/\D/g, "").slice(-10);
  
  if (!cleanPhone || cleanPhone.length !== 10) {
    return {
      success: false,
      error: "Invalid 10-digit mobile number."
    };
  }

  const messageText = `${otp} is your Vintage Fashion verification code. Valid for 10 minutes. Please do not share this OTP with anyone.`;
  let smsDelivered = false;
  let providerUsed = null;

  // 1. Fast2SMS Provider (India)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      // Try Quick route
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          "authorization": process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: String(otp),
          numbers: cleanPhone
        })
      });

      const data = await response.json();
      if (data.return === true || data.status_code === 200) {
        console.log(`[SMS Service] OTP sent successfully via Fast2SMS to +91 ${cleanPhone}`);
        smsDelivered = true;
        providerUsed = "fast2sms";
      } else {
        console.warn("[SMS Service] Fast2SMS OTP route response:", data);
        // Try fallback route 'q' for quick SMS
        const qRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
          method: "POST",
          headers: {
            "authorization": process.env.FAST2SMS_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            route: "q",
            message: messageText,
            language: "english",
            numbers: cleanPhone
          })
        });
        const qData = await qRes.json();
        if (qData.return === true || qData.status_code === 200) {
          console.log(`[SMS Service] OTP sent successfully via Fast2SMS quick route to +91 ${cleanPhone}`);
          smsDelivered = true;
          providerUsed = "fast2sms";
        }
      }
    } catch (err) {
      console.error("[SMS Service] Fast2SMS dispatch failed:", err.message);
    }
  }

  // 2. 2Factor Provider (India)
  if (!smsDelivered && process.env.TWO_FACTOR_API_KEY) {
    try {
      const apiKey = process.env.TWO_FACTOR_API_KEY;
      const res = await fetch(`https://2factor.in/API/V1/${apiKey}/SMS/${cleanPhone}/${otp}/AUTOGEN`);
      const data = await res.json();
      if (data.Status === "Success") {
        console.log(`[SMS Service] OTP sent successfully via 2Factor to +91 ${cleanPhone}`);
        smsDelivered = true;
        providerUsed = "2factor";
      }
    } catch (err) {
      console.error("[SMS Service] 2Factor dispatch failed:", err.message);
    }
  }

  // 3. Twilio Provider (Global/India)
  if (!smsDelivered && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const token = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_PHONE_NUMBER;
      const to = `+91${cleanPhone}`;

      const params = new URLSearchParams();
      params.append("To", to);
      params.append("From", from);
      params.append("Body", messageText);

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: "POST",
        headers: {
          "Authorization": "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`[SMS Service] OTP sent successfully via Twilio to ${to}`);
        smsDelivered = true;
        providerUsed = "twilio";
      } else {
        console.warn("[SMS Service] Twilio returned error:", data);
      }
    } catch (err) {
      console.error("[SMS Service] Twilio dispatch failed:", err.message);
    }
  }

  // 4. If Email is provided, also send Phone OTP to email so user receives it immediately
  if (email && email.includes("@")) {
    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: email.trim().toLowerCase(),
        subject: `Your Vintage Fashion Mobile Verification Code: ${otp}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #0f172a; margin-top: 0;">Mobile Verification Code</h2>
            <p style="color: #475569; font-size: 14px;">Use the verification code below for mobile number <strong>+91 ${cleanPhone}</strong> on Vintage Fashion:</p>
            <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #db2777; font-family: monospace;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">Valid for 10 minutes. If you did not request this, please disregard this email.</p>
          </div>
        `
      });
      console.log(`[SMS Service] Phone verification code backup also sent to email ${email}`);
    } catch (emailErr) {
      console.warn("[SMS Service] Email backup dispatch note:", emailErr.message);
    }
  }

  // 5. Console output
  console.log(`
┌────────────────────────────────────────────────────────────┐
│ 📱 [SMS SERVICE] MOBILE OTP CODE                          │
├────────────────────────────────────────────────────────────┤
│  Recipient: +91 ${cleanPhone.padEnd(41)} │
│  OTP Code:  \x1b[32m\x1b[1m${otp}\x1b[0m${" ".repeat(37)} │
│  Recipient: ${(name || "Valued Customer").padEnd(41)} │
│  Provider:  ${(providerUsed || "Live Email / Preview Mode").padEnd(41)} │
│  Validity:  10 Minutes                                     │
└────────────────────────────────────────────────────────────┘
  `);

  return {
    success: true,
    provider: providerUsed || "preview",
    message: smsDelivered
      ? `Verification code sent via SMS to +91 ${cleanPhone}`
      : `Verification code sent to +91 ${cleanPhone}`,
    previewOtp: otp
  };
};
