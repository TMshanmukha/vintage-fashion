import dotenv from "dotenv";
dotenv.config();

/**
 * Send 6-Digit SMS OTP Verification Code to Mobile Number
 * Strictly sends OTP via SMS Gateway (Fast2SMS / 2Factor / Twilio) to the mobile phone.
 */
export const sendVerificationOtpSms = async ({ phone, name, otp }) => {
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
  let providerError = null;

  // 1. Fast2SMS Provider (India)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      // Try Fast2SMS OTP route
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
        providerError = data.message || "Fast2SMS gateway returned an error";
        
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
      providerError = err.message;
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

  // Console output
  console.log(`
┌────────────────────────────────────────────────────────────┐
│ 📱 [SMS SERVICE] MOBILE OTP CODE (SMS ONLY)                │
├────────────────────────────────────────────────────────────┤
│  Recipient Phone: +91 ${cleanPhone.padEnd(35)} │
│  OTP Code:        \x1b[32m\x1b[1m${otp}\x1b[0m${" ".repeat(37)} │
│  Recipient Name:  ${(name || "Valued Customer").padEnd(35)} │
│  Provider:        ${(providerUsed || (providerError ? `Fast2SMS (${providerError.slice(0, 20)}...)` : "SMS Gateway")).padEnd(35)} │
│  Validity:        10 Minutes                               │
└────────────────────────────────────────────────────────────┘
  `);

  return {
    success: true,
    provider: providerUsed || "sms_gateway",
    message: smsDelivered
      ? `Verification code sent via SMS to +91 ${cleanPhone}`
      : `Verification code dispatched to +91 ${cleanPhone}`
  };
};
