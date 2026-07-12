export const authorizeAdmin = (req, res, next) => {
    try {

        // req.user is set by your authenticate middleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admins only."
            });
        }

        next();

    } catch (error) {

        console.error("Admin Authorization Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};