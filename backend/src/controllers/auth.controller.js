import { signupService,loginService,logoutService,forgotPasswordService,resetPasswordService } from "../services/auth.service.js";

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

export const logout = async (req, res) => {

    try {
        console.log(req.cookies);

        const sessionId = req.cookies.sessionId;

        await logoutService(sessionId);

        res.clearCookie("refreshToken");

        res.clearCookie("sessionId");

        res.json({
            success: true,
            message: "Logout Successful"
        });

    } catch (error) {
        console.error("Logout Error:", error);

        res.status(400).json({
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
        console.log(result);

        const { accessToken, refreshToken, user,sessionId } = result;

        res.cookie("sessionId", sessionId, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false,      // true in production with HTTPS
                sameSite: "lax",
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            })
            .status(200)
            .json({
                success: true,
                message: "Login Successful",
                data: {
                    user,
                    accessToken,
                    sessionId
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
    console.log("======signup=====");
    console.log("BODY:", req.body);
    console.log("BODY:", req.file?.path);

    try {
        console.log(JSON.stringify(req.body, null, 2));
        console.log(JSON.stringify(req.file, null, 2));

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

        const { user, accessToken, refreshToken,sessionId } = result;

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