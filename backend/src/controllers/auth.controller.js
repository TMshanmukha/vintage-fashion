import {
    signupService,
    loginService,
    logoutService,
    forgotPasswordService,
    resetPasswordService,
    adminLoginService,
    sendOtpService,
    verifyOtpService,
    sendPhoneOtpService,
    verifyPhoneOtpService
} from "../services/auth.service.js";

import { refreshTokenService } from "../services/auth.service.js";
import { getSessionById } from "../models/session.model.js";
import { getIO } from "../socket/index.js";

const isProduction = process.env.NODE_ENV === "production" || !!process.env.RENDER;

const getCookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    ...(maxAge ? { maxAge } : {})
});

const getClearCookieOptions = () => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax"
});

export const sendOtp = async (req, res) => {
    try {
        const { email, name } = req.body;
        const result = await sendOtpService({ email, name });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to send verification code."
        });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const result = await verifyOtpService({ email, otp });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Invalid or expired verification code."
        });
    }
};

export const sendPhoneOtp = async (req, res) => {
    try {
        const { phone, name } = req.body;
        const result = await sendPhoneOtpService({ phone, name });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to send mobile verification code."
        });
    }
};

export const verifyPhoneOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const result = await verifyPhoneOtpService({ phone, otp });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Invalid or expired mobile verification code."
        });
    }
};

export const refresh = async (req, res) => {
    try {
        const sessionId = req.cookies?.sessionId || req.body?.sessionId;
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

        if (!sessionId || !refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please sign in again."
            });
        }

        const result = await refreshTokenService({ sessionId, refreshToken });

        const cookieAge = 30 * 24 * 60 * 60 * 1000; // 30 days

        res.cookie("refreshToken", result.refreshToken, getCookieOptions(cookieAge));

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully.",
            data: {
                accessToken: result.accessToken
            }
        });

    } catch (error) {
        res.clearCookie("refreshToken", getClearCookieOptions());
        res.clearCookie("sessionId", getClearCookieOptions());

        return res.status(401).json({
            success: false,
            message: "Session expired. Please sign in again."
        });
    }
};

export const resetPassword = async (req, res) => {

    try {

        const { token, password } = req.body;

        const result = await resetPasswordService({
            token,
            password
        });

        res.status(200).json(result);

    } catch (error) {

        console.error(error);

        res.status(400).json({
            success: false,
            message: error.message || "Unable to reset password. Please try again."
        });

    }

};

export const forgotPassword = async (req, res) => {
    try {

        await forgotPasswordService(req.body.email);

        res.status(200).json({
            success: true,
            message:
                "If the email exists, a password reset link has been sent."
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// Customer logout. We look up the session BEFORE deleting it so we know
// which user to notify over the socket — we never trust a client-sent
// userId since that's easy to spoof and the frontend wasn't sending it anyway.
export const logout = async (req, res) => {

    try {

        const sessionId = req.cookies.sessionId;
        let userId = null;

        if (sessionId) {
            const session = await getSessionById(sessionId);
            userId = session?.user_id || null;

            await logoutService(sessionId);
        }

        res.clearCookie("sessionId", getClearCookieOptions());
        res.clearCookie("refreshToken", getClearCookieOptions());

        if (userId) {
            try {
                getIO().to(`user:${userId}`).emit("session:changed", { event: "logout" });
            } catch (err) {
                console.warn("Socket emit skipped:", err.message);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Logout Successful"
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

export const login = async (req, res) => {

    try {

        const result = await loginService({

            ...req.body,

            userAgent: req.headers["user-agent"],

            ipAddress: req.ip

        });

        const { accessToken, refreshToken, user, sessionId } = result;

        const isAdmin = user.role === "admin";

        const sessionCookieName = isAdmin
            ? "adminSessionId"
            : "sessionId";

        const refreshCookieName = isAdmin
            ? "adminRefreshToken"
            : "refreshToken";

        const cookieAge = 30 * 24 * 60 * 60 * 1000; // 30 days

        res.cookie(sessionCookieName, sessionId, getCookieOptions(cookieAge));
        res.cookie(refreshCookieName, refreshToken, getCookieOptions(cookieAge));

        try {
            getIO().to(`user:${user.id}`).emit("session:changed", { event: "login" });
        } catch (err) {
            console.warn("Socket emit skipped:", err.message);
        }

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            data: {
                user,
                accessToken
            }
        });

    }

    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};

export const signup = async (req, res) => {

    try {

        const { name, email, password, phone, otp, phoneOtp } = req.body;
        const avatarUrl = req.file?.path;

        const result = await signupService({
            name,
            email,
            password,
            otp,
            phone,
            phoneOtp: phoneOtp || req.body.phone_otp,
            avatarUrl,
            userAgent: req.headers["user-agent"],
            ipAddress: req.ip
        });

        const { user, accessToken, refreshToken, sessionId } = result;

        res.cookie("refreshToken", refreshToken, getCookieOptions(30 * 24 * 60 * 60 * 1000));
        res.cookie("sessionId", sessionId, getCookieOptions(30 * 24 * 60 * 60 * 1000));

        res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: {
                user,
                accessToken,
                sessionId
            }
        });

    } catch (error) {

        console.error("Signup Error:", error);

        res.status(400).json({
            success: false,
            message: error.message || "Failed to create account. Please check your details."
        });

    }
};

//admin

export const adminLogin = async (req, res) => {

    try {

        const result = await adminLoginService({

            ...req.body,

            userAgent: req.headers["user-agent"],

            ipAddress: req.ip

        });

        const {
            accessToken,
            refreshToken,
            user,
            sessionId
        } = result;

        if (user.role !== "admin") {

            return res.status(403).json({
                success: false,
                message: "Access denied. Admins only."
            });

        }

        const cookieAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        res.cookie("adminSessionId", sessionId, getCookieOptions(cookieAge));
        res.cookie("adminRefreshToken", refreshToken, getCookieOptions(cookieAge));

        try {
            getIO().to(`admin:${user.id}`).emit("session:changed", { event: "login" });
        } catch (err) {
            console.warn("Socket emit skipped:", err.message);
        }

        res.status(200).json({
            success: true,
            message: "Admin login successful.",
            data: {
                user,
                accessToken
            }
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

export const adminRefresh = async (req, res) => {

    try {

        const sessionId = req.cookies?.adminSessionId || req.body?.sessionId;
        const refreshToken = req.cookies?.adminRefreshToken || req.body?.refreshToken;

        if (!sessionId || !refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please log in again."
            });
        }

        const result = await refreshTokenService({
            sessionId,
            refreshToken
        });

        const cookieAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        res.cookie("adminRefreshToken", result.refreshToken, getCookieOptions(cookieAge));

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully.",
            data: {
                accessToken: result.accessToken
            }
        });

    } catch (error) {

        res.clearCookie("adminRefreshToken", getClearCookieOptions());
        res.clearCookie("adminSessionId", getClearCookieOptions());

        return res.status(401).json({
            success: false,
            message: "Session expired. Please log in again."
        });

    }

};

// Same fix as customer logout: look up the session's user before deleting
// it, so we know who to notify. Also wrapped in try/catch now — the
// original had none, so any failure here would crash the request with an
// unhandled rejection instead of returning a clean error response.
export const adminLogout = async (req, res) => {

    try {

        const sessionId = req.cookies?.adminSessionId;
        let userId = null;

        if (sessionId) {
            const session = await getSessionById(sessionId);
            userId = session?.user_id || null;

            await logoutService(sessionId);
        }

        res.clearCookie("adminSessionId", getClearCookieOptions());
        res.clearCookie("adminRefreshToken", getClearCookieOptions());

        if (userId) {
            try {
                getIO().to(`admin:${userId}`).emit("session:changed", { event: "logout" });
            } catch (err) {
                console.warn("Socket emit skipped:", err.message);
            }
        }

        return res.json({
            success: true
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};