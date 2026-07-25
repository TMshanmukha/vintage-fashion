import { Router } from "express";
import { getSettings } from "../controllers/settings.controller.js";

const router = Router();

// Public — used by storefront (announcement bar, shipping calc, etc.)
router.get("/", getSettings);

export default router;

// In your main app/server file:
// import settingsRoutes from "./routes/settings.routes.js";
// app.use("/api/settings", settingsRoutes);
//
// NOTE: if you already have an admin settings endpoint (e.g. for editing
// announcement_text from the admin panel), that's a *different* route —
// this one is public/read-only and shouldn't conflict as long as it's
// mounted at a different path (e.g. admin's is under /api/admin/settings).
