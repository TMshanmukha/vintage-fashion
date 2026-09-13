import { v4 as uuidv4 } from "uuid";

import {
    findUserByEmail,
    findUserByPhone,
    createUser
} from "../models/user.model.js";

import { createSession, deleteSession } from "../models/session.model.js";

import {
    hashPassword, comparePassword, hashToken, compareTokenHash
} from "../utils/hash.js";

import {
    generateAccessToken,
    generateRefreshToken
} from "../utils/jwt.js";

import crypto from "crypto";
import {
    createPasswordReset,
    deletePasswordResetsByUserId,
    getActiveResetTokens,
    updatePassword,
    markResetTokenUsed,
    deleteSessionsByUserId
} from "../models/passwordReset.model.js";

import { sendResetPasswordEmail } from "../utils/mail.util.js";

import { getSessionById, updateSessionRefreshToken } from "../models/session.model.js";
import { findUserById } from "../models/user.model.js";

import * as NotificationService from "./notificationService.js";
import { sendWelcomeEmail, sendVerificationOtpEmail } from "./emailService.js";
import { createEmailVerification, verifyEmailOtp } from "../models/emailVerification.model.js";
import { sendVerificationOtpSms } from "./smsService.js";
import { createPhoneVerification, verifyPhoneOtp, isPhoneVerified } from "../models/phoneVerification.model.js";
import { getNextSequence } from "./sequence.service.js";

export const sendOtpService = async ({ email, name }) => {
    if (!email || !email.includes("@")) {
        throw new Error("Please enter a valid email address.");
    }
    const cleanEmail = email.toLowerCase().trim();

    // Check if email already registered
    const existingUser = await findUserByEmail(cleanEmail);
    if (existingUser) {
        throw new Error("An account with this email is already registered. Please sign in instead.");
    }

    // Generate 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await createEmailVerification({
        email: cleanEmail,
        otpCode: otp,
        expiresAt
    });

    const sendRes = await sendVerificationOtpEmail({
        email: cleanEmail,
        name: name || "",
        otp
    });

    if (!sendRes.success) {
        throw new Error("Could not send verification code to this email. Please check the address.");
    }

    return {
        success: true,
        message: `Verification code sent to ${cleanEmail}`
    };
};

export const verifyOtpService = async ({ email, otp }) => {
    if (!email || !otp) {
        throw new Error("Email and verification code are required.");
    }
    const verification = await verifyEmailOtp({ email, otpCode: otp });
    if (!verification.valid) {
        throw new Error(verification.message || "Invalid or expired verification code.");
    }
    return { success: true, message: "Email verified successfully." };
};

export const sendPhoneOtpService = async ({ phone, name, email }) => {
    const cleanPhone = String(phone || "").trim().replace(/\D/g, "").slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
        throw new Error("Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).");
    }

    // Check if mobile number already registered
    const existingUser = await findUserByPhone(cleanPhone);
    if (existingUser) {
        throw new Error("An account with this mobile number is already registered. Please sign in instead.");
    }

    // Generate 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await createPhoneVerification({
        phone: cleanPhone,
        otpCode: otp,
        expiresAt
    });

    const sendRes = await sendVerificationOtpSms({
        phone: cleanPhone,
        name: name || "",
        otp,
        email: email || ""
    });

    if (!sendRes.success) {
        throw new Error(sendRes.error || "Could not send verification code to this mobile number.");
    }

    return {
        success: true,
        message: `Verification code sent to +91 ${cleanPhone}`
    };
};

export const verifyPhoneOtpService = async ({ phone, otp }) => {
    const cleanPhone = String(phone || "").trim().replace(/\D/g, "").slice(-10);
    if (!cleanPhone || !otp) {
        throw new Error("Mobile number and verification code are required.");
    }
    const verification = await verifyPhoneOtp({ phone: cleanPhone, otpCode: otp });
    if (!verification.valid) {
        throw new Error(verification.message || "Invalid or expired mobile verification code.");
    }
    return { success: true, message: "Mobile number verified successfully." };
};

export const refreshTokenService = async ({ sessionId, refreshToken }) => {

    if (!sessionId || !refreshToken) {
        throw new Error("Refresh token is required.");
    }

    const session = await getSessionById(sessionId);

    if (!session) {
        throw new Error("Invalid session.");
    }

    if (new Date(session.expires_at) < new Date()) {
        await deleteSession(sessionId);
        throw new Error("Session expired.");
    }

    const isValid = await compareTokenHash(refreshToken, session.refresh_token_hash);

    if (!isValid) {
        // Token doesn't match what's on record — treat as compromised, kill the session
        await deleteSession(sessionId);
        throw new Error("Invalid refresh token.");
    }

    const user = await findUserById(session.user_id);

    if (!user) {
        await deleteSession(sessionId);
        throw new Error("User not found.");
    }

    const accessToken = generateAccessToken({
        userId: user.user_id,
        email: user.email,
        role: user.role
    });

    // Rotate the refresh token so a stolen old one becomes useless
    const newRefreshToken = generateRefreshToken({
        userId: user.user_id,
        email: user.email,
        role: user.role
    });

    const newRefreshTokenHash = hashToken(newRefreshToken);

    const sessionDuration =
        user.role === "admin"
            ? 8 * 60 * 60 * 1000
            : 30 * 24 * 60 * 60 * 1000;

    await updateSessionRefreshToken(
        sessionId,
        newRefreshTokenHash,
        new Date(Date.now() + sessionDuration)
    );

    return {
        accessToken,
        refreshToken: newRefreshToken,
        role: user.role
    };

};

export const resetPasswordService = async ({
    token,
    password
}) => {

    // 1. Get all valid reset tokens

    const resetTokens = await getActiveResetTokens();

    let matchedToken = null;

    // 2. Compare received token with every hash

    for (const reset of resetTokens) {

        console.log("Checking token:", reset.reset_id);

        const matched = await compareTokenHash(
            token,
            reset.token_hash
        );

        console.log("Matched:", matched);

        if (matched) {
            matchedToken = reset;
            break;
        }

    }

    // 3. Token not found

    if (!matchedToken) {

        throw new Error("Invalid or expired reset link");

    }

    // 4. Hash new password

    const passwordHash = await hashPassword(password);

    // 5. Update user password

    await updatePassword(
        matchedToken.user_id,
        passwordHash
    );

    // 6. Mark token used

    await markResetTokenUsed(
        matchedToken.reset_id
    );

    // 7. Delete all login sessions

    await deleteSessionsByUserId(
        matchedToken.user_id
    );

    return {

        success: true,

        message: "Password reset successful"

    };

};

export const forgotPasswordService = async (email) => {
    const user = await findUserByEmail(email);
    if (!user) {

        return;
    }

    const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = hashToken(token);

    await deletePasswordResetsByUserId(
        user.user_id
    );

    const expiresAt = new Date(
        Date.now() + 15 * 60 * 1000
    );

    const result = await createPasswordReset({

        userId: user.user_id,

        tokenHash,

        expiresAt

    });

    await sendResetPasswordEmail({

        email: user.email,

        resetId: result.insertId,

        token

    });


};

export const logoutService = async (sessionId) => {

    await deleteSession(sessionId);

};


export const signupService = async ({
    name,
    email,
    password,
    otp,
    phone,
    phoneOtp,
    avatarUrl,
    userAgent,
    ipAddress
}) => {
    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone ? String(phone).trim().replace(/\D/g, "").slice(-10) : null;

    // 1. Check email already exists
    const existingUser = await findUserByEmail(cleanEmail);
    if (existingUser) {
        throw new Error("An account with this email is already registered. Please sign in instead.");
    }

    // 1b. Check mobile number already exists
    if (cleanPhone) {
        const existingPhoneUser = await findUserByPhone(cleanPhone);
        if (existingPhoneUser) {
            throw new Error("An account with this mobile number is already registered. Please sign in instead.");
        }
    }

    // 2. Verify Email OTP
    if (!otp) {
        throw new Error("Please enter the 6-digit verification code sent to your email.");
    }

    const verification = await verifyEmailOtp({ email: cleanEmail, otpCode: otp });
    if (!verification.valid) {
        throw new Error(verification.message || "Invalid or expired email verification code. Please request a new code.");
    }

    // 3. Verify Phone OTP (if phone is provided)
    if (cleanPhone) {
        if (phoneOtp) {
            const phoneVer = await verifyPhoneOtp({ phone: cleanPhone, otpCode: phoneOtp });
            if (!phoneVer.valid) {
                throw new Error(phoneVer.message || "Invalid or expired mobile verification code.");
            }
        } else {
            const alreadyVerified = await isPhoneVerified(cleanPhone);
            if (!alreadyVerified) {
                throw new Error("Please verify your mobile number with the 6-digit verification code.");
            }
        }
    }

    // 4. Hash Password
    const passwordHash = await hashPassword(password);

    // 5. Generate clean sequential business code
    const userCode = await getNextSequence("user");

    // 6. Save User
    const result = await createUser({
        userCode,
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        phone: cleanPhone,
        avatarUrl,
        isEmailVerified: 1
    });

    const userId = result.insertId;

    NotificationService.createNotification({
        title: "New User Registered",
        body: `${name} (${userCode}) created a new account.`,
        type: "user",
        referenceId: userId
    }).catch(err => console.error("Notification creation failed:", err));

    sendWelcomeEmail({ to: cleanEmail, customerName: name })
        .catch(err => console.error("Welcome email dispatch failed:", err));

    // 6. Generate Tokens
    const accessToken = generateAccessToken({
        userId,
        email: cleanEmail
    });

    const refreshToken = generateRefreshToken({
        userId,
        email: cleanEmail
    });

    const refreshTokenHash = hashToken(refreshToken);

    // 7. Create Session
    const sessionId = uuidv4();

    await createSession({
        session_id: sessionId,
        userId,
        refreshTokenHash,
        userAgent,
        ipAddress,
        expiresAt: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
        )
    });

    return {
        user: {
            id: userId,
            user_id: userId,
            user_code: userCode,
            name,
            email: cleanEmail,
            phone,
            avatarUrl,
            role: "customer"
        },
        accessToken,
        refreshToken,
        sessionId
    };
};

export const loginService = async ({
    email,
    password,
    userAgent,
    ipAddress
}) => {

    // Find user
    const user = await findUserByEmail(email);

    if (!user) {
        throw new Error("Invalid email or password");
    }

    if (user.role !== "customer") {
        throw new Error("Invalid email or password");
    }

    if (user.account_status === "BLOCKED") {
        throw new Error("Your account has been blocked by admin");
    }

    // Compare password
    const isMatch = await comparePassword(
        password,
        user.password_hash
    );

    if (!isMatch) {
        throw new Error("Invalid email or password");
    }

    // Generate Tokens
    const accessToken = generateAccessToken({
        userId: user.user_id,
        email: user.email,
        role: user.role
    });

    const refreshToken = generateRefreshToken({
        userId: user.user_id,
        email: user.email,
        role: user.role
    });

    const refreshTokenHash = hashToken(refreshToken);

    // Save Session

    const sessionId = uuidv4();

    const sessionDuration =
        user.role === "admin"
            ? 8 * 60 * 60 * 1000
            : 30 * 24 * 60 * 60 * 1000;

    await createSession({
        session_id: sessionId,
        userId: user.user_id,
        refreshTokenHash,
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + sessionDuration)
    });

    return {

        user: {

            id: user.user_id,

            name: user.name,

            email: user.email,

            phone: user.phone,

            avatarUrl: user.avatar_url,

            role: user.role,

        },

        accessToken,

        refreshToken,

        sessionId
    };

};

export const adminLoginService = async ({
 email,
 password,
 userAgent,
 ipAddress
}) => {

    const user = await findUserByEmail(email);


    if(!user){
        throw new Error("Invalid email or password");
    }


    if(user.role !== "admin"){
        throw new Error("Only admins can login here");
    }


    const isMatch = await comparePassword(
        password,
        user.password_hash
    );


    if(!isMatch){
        throw new Error("Invalid email or password");
    }


    const accessToken = generateAccessToken({
        userId:user.user_id,
        email:user.email,
        role:user.role
    });


    const refreshToken = generateRefreshToken({
        userId:user.user_id,
        email:user.email,
        role:user.role
    });


    const refreshTokenHash = hashToken(refreshToken);


    const sessionId = uuidv4();


    await createSession({
        session_id:sessionId,
        userId:user.user_id,
        refreshTokenHash,
        userAgent,
        ipAddress,
        expiresAt:new Date(
            Date.now()+8*60*60*1000
        )
    });


    return {
        user:{
            id:user.user_id,
            name:user.name,
            email:user.email,
            role:user.role
        },
        accessToken,
        refreshToken,
        sessionId
    };

};