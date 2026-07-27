import { signupService,loginService,logoutService,forgotPasswordService,resetPasswordService,adminLoginService } from "../services/auth.service.js";

import { refreshTokenService } from "../services/auth.service.js";
import { getSessionById } from "../models/session.model.js";
import { getIO } from "../socket/index.js";

export const refresh = async (req, res) => {

    try {

        const sessionId = req.cookies.sessionId;
        const refreshToken = req.cookies.refreshToken;

        const result = await refreshTokenService({ sessionId, refreshToken });

        const isAdmin = !!req.cookies.adminSessionId;

        const refreshCookieName = isAdmin
            ? "adminRefreshToken"
            : "refreshToken";

        const cookieAge = isAdmin
            ? 8 * 60 * 60 * 1000
            : 30 * 24 * 60 * 60 * 1000;

        res.cookie(refreshCookieName, result.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: cookieAge
        });

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully.",
            data: {
                accessToken: result.accessToken
            }
        });

    } catch (error) {

        console.error("Refresh Error:", error);

        res.clearCookie("refreshToken");
        res.clearCookie("sessionId");

        return res.status(401).json({
            success: false,
            message: error.message || "Could not refresh session."
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

    }catch (error) {

        console.error(error);

        res.status(400).json({
            success: false,
            message: error.message,
            stack: error.stack
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

        res.clearCookie("sessionId", {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        });

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

        const cookieAge = isAdmin
            ? 8 * 60 * 60 * 1000
            : 30 * 24 * 60 * 60 * 1000;

        res.cookie(sessionCookieName, sessionId, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: cookieAge
        });

        res.cookie(refreshCookieName, refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: cookieAge
        });

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

        const { name, email, password, phone } = req.body;
        const avatarUrl = req.file?.path;

        const result = await signupService({
            name,
            email,
            password,
            phone,
            avatarUrl,
            userAgent: req.headers["user-agent"],
            ipAddress: req.ip
        });

        const { user, accessToken, refreshToken, sessionId } = result;

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false, // true in production
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.cookie("sessionId", sessionId, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

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
            message: error.message,
            stack: error.stack
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

        res.cookie("adminSessionId", sessionId, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 8 * 60 * 60 * 1000
        });

        res.cookie("adminRefreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 8 * 60 * 60 * 1000
        });

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

        const sessionId = req.cookies.adminSessionId;

        const refreshToken = req.cookies.adminRefreshToken;

        const result = await refreshTokenService({
            sessionId,
            refreshToken
        });

        res.cookie("adminRefreshToken", result.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 8 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully.",
            data: {
                accessToken: result.accessToken
            }
        });

    } catch (error) {

        res.clearCookie("adminRefreshToken");
        res.clearCookie("adminSessionId");

        return res.status(401).json({
            success: false,
            message: error.message
        });

    }

};

// Same fix as customer logout: look up the session's user before deleting
// it, so we know who to notify. Also wrapped in try/catch now — the
// original had none, so any failure here would crash the request with an
// unhandled rejection instead of returning a clean error response.
export const adminLogout = async (req, res) => {

    try {

        const sessionId = req.cookies.adminSessionId;
        let userId = null;

        if (sessionId) {
            const session = await getSessionById(sessionId);
            userId = session?.user_id || null;

            await logoutService(sessionId);
        }

        res.clearCookie("adminSessionId");
        res.clearCookie("adminRefreshToken");

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