import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        console.log(authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access token is required."
            });
        }
        console.log("Header:", JSON.stringify(authHeader));

        const parts = authHeader.split(" ");

        console.log(parts);
        console.log(parts.length);

        const token = parts[1];

        console.log("Token:", JSON.stringify(token));
        console.log("Secret:", process.env.JWT_ACCESS_SECRET);

        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );

        console.log(decoded);

        req.user = decoded;

        next();

    } catch (error) {

        console.log(error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token."
        });

    }

};