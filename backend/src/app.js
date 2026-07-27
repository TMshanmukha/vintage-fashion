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
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";

import settingsRoutes from "./routes/settings.routes.js";
import addressRoutes from "./routes/address.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import contactRoutes from "./routes/contact.routes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://vintage-fashion-xi.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Request Origin:", origin);

      if (!origin || allowedOrigins.includes(origin)) {
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

app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);

app.use("/api/settings", settingsRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/checkout", checkoutRoutes);

app.use("/api/contact", contactRoutes);
export default app;