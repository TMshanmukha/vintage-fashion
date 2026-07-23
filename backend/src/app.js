import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import brandRoutes from "./routes/brand.routes.js";
import marketingRoutes from "./routes/marketing.routes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import myOrderRoutes from "./routes/customerOrder.routes.js";

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);
app.use(cookieParser());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/brands", brandRoutes);
app.use(
    "/api/admin/marketing",
    marketingRoutes
);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/notifications", notificationRoutes);
app.use("/api/admin/emails", emailRoutes);
app.use("/api/admin/orders", orderRoutes);
app.use("/api/orders", myOrderRoutes);

export default app;