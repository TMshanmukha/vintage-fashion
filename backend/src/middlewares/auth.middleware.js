import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
    console.log("========== AUTH ==========");
    console.log("Authorization:", req.headers.authorization);

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.log("No Bearer token");
            return res.status(401).json({
                success: false,
                message: "Access token is required."
            });
        }

        const token = authHeader.split(" ")[1];

        console.log("JWT Secret:", process.env.JWT_ACCESS_SECRET);

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        console.log("Decoded:", decoded);

        req.user = decoded;

        next();

    } catch (err) {
        console.log("JWT ERROR:", err);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token."
        });
    }
};