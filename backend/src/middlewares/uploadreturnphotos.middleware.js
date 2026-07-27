import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Same pattern as your existing avatar/product image uploads — Multer
// streams straight to Cloudinary, and req.files[].path ends up holding
// the Cloudinary secure URL, ready to store in the DB directly.
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "vintage-fashion/returns",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
});

export const uploadReturnPhotos = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per photo
});