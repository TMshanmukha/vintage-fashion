import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ZodError } from "zod";
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
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";

import settingsRoutes from "./routes/settings.routes.js";
import addressRoutes from "./routes/address.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import shippingRoutes from "./routes/shiprocket.routes.js";
import reviewRoutes from "./routes/review.routes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://vintage-fashion-xi.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Request Origin:", origin);

      if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked Origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.send("Vintage Fashion Backend API is running.");
});

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
app.use("/api/admin/reviews", reviewRoutes);
app.use("/api/orders", myOrderRoutes);

app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);

app.use("/api/settings", settingsRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/shipping", shippingRoutes);

app.use("/api/contact", contactRoutes);
app.use("/api/reviews", reviewRoutes);
app.use((err, req, res, next) => {
  console.error("Application Error:", err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: err.issues?.[0]?.message || "Invalid input data. Please check and try again.",
      errors: err.issues || [],
    });
  }

  const statusCode = err.status || (err.name === "UnauthorizedError" ? 401 : 500);
  
  // Guard against leaking internal database or system crash messages to client
  let clientMessage = err.message || "Something went wrong on our end. Please try again.";
  if (statusCode === 500 && (err.code?.startsWith("ER_") || err.sqlMessage || err.code === "ECONNREFUSED")) {
    clientMessage = "We are currently experiencing a technical issue. Please try again in a few moments.";
  }

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
  });
});
export default app;
