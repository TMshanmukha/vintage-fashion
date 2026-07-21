import { v4 as uuidv4 } from "uuid";

import {
    findUserByEmail,
    createUser} from "../models/user.model.js";

import {createSession,deleteSession} from "../models/session.model.js";

import {
    hashPassword,comparePassword } from "../utils/hash.js";

import {
    generateAccessToken,
    generateRefreshToken } from "../utils/jwt.js";

import crypto from "crypto";
import bcrypt from "bcrypt";
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

    const isValid = await bcrypt.compare(refreshToken, session.refresh_token_hash);

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

    const newRefreshTokenHash = await hashPassword(newRefreshToken);

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

        const matched = await bcrypt.compare(
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

    const token =crypto.randomBytes(32).toString("hex");

    const tokenHash = await hashPassword(token);

    await deletePasswordResetsByUserId(
        user.user_id
    );

    const expiresAt = new Date(
        Date.now() + 15 * 60 * 1000
    );
    
    const result =await createPasswordReset({

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
    phone,
    avatarUrl,
    userAgent,
    ipAddress
}) => {

    // 1. Check email already exists

    const existingUser = await findUserByEmail(email);

    if (existingUser) {

        throw new Error("Email already registered");

    }

    // 2. Hash Password
    console.log("Password before hash:", password);
    console.log("Type:", typeof password);
    const passwordHash = await hashPassword(password);

    console.log("Signup Data");
    console.log({
        name,
        email,
        password,
        phone,
        avatarUrl
    });

    // 3. Save User

    const result = await createUser({
        name,
        email,
        passwordHash,
        phone,
        avatarUrl
    });

    const userId = result.insertId;

    // 4. Generate Tokens

    const accessToken = generateAccessToken({
        userId,
        email
    });

    const refreshToken = generateRefreshToken({
        userId,
        email
    });

    const refreshTokenHash = await hashPassword(refreshToken);

    // 5. Create Session

    const sessionId =  uuidv4();

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

            name,

            email,

            phone,

            avatarUrl

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

    const refreshTokenHash = await hashPassword(refreshToken);

    // Save Session

    const sessionId =  uuidv4();

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
            
            role:user.role,

        },

        accessToken,

        refreshToken,

        sessionId
    };

};