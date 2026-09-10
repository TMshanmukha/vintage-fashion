import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
    try {
        let token = null;
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else if (req.cookies?.adminAccessToken) {
            token = req.cookies.adminAccessToken;
        } else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        } else if (req.headers["x-access-token"]) {
            token = req.headers["x-access-token"];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token is required."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token."
        });
    }
};