import { Router } from "express";
import { submitContact } from "../controllers/contact.controller.js";

const router = Router();

// Public route — no authenticate middleware, since anyone browsing
// the storefront (logged in or not) should be able to send a message.
router.post("/", submitContact);

export default router;
