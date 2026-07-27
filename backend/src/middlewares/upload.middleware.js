import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Per-context upload presets. Add new entries here as new upload types appear
// instead of reusing "categories" for everything.
const UPLOAD_PRESETS = {
  category: {
    folder: "categories",
    transformation: [{ width: 400, height: 400, crop: "fill" }],
  },
  desktop_image: {
    folder: "banners/desktop",
    transformation: [{ width: 1600, height: 600, crop: "fill", gravity: "auto" }],
  },
  mobile_image: {
    folder: "banners/mobile",
    transformation: [{ width: 800, height: 1000, crop: "fill", gravity: "auto" }],
  },
  banner_image: { // flash sale banner
    folder: "flash-sales",
    transformation: [{ width: 1600, height: 700, crop: "fill", gravity: "auto" }],
  },
  card_image: { // promotional cards — field name is "image" in your route
    folder: "promotional-cards",
    transformation: [{ width: 800, height: 800, crop: "fill", gravity: "auto" }],
  },
  image: { // generic fallback for the promo card's actual field name
    folder: "promotional-cards",
    transformation: [{ width: 800, height: 800, crop: "fill", gravity: "auto" }],
  },
  product_image: {
    folder: "products",
    transformation: [{ width: 1000, height: 1000, crop: "fill", gravity: "auto" }],
  },
  avatar: {
    folder: "avatars",
    transformation: [{ width: 300, height: 300, crop: "fill", gravity: "face" }],
  },
  logo: { // brand logos
    folder: "brands",
    transformation: [{ width: 400, height: 400, crop: "fit", background: "white" }],
  },
};

const DEFAULT_PRESET = {
  folder: "misc",
  transformation: [{ width: 1000, height: 1000, crop: "limit" }], // "limit" = don't upscale/crop, just cap size
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const preset = UPLOAD_PRESETS[file.fieldname] || DEFAULT_PRESET;
    return {
      folder: preset.folder,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: preset.transformation,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default upload;