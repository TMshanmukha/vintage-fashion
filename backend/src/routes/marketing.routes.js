import { Router } from "express";

import {
  getSiteSettings,
  updateSiteSettings,
} from "../controllers/marketing/marketing.controller.js";

import {
  getAllBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
  setBannerProducts,
} from "../controllers/marketing/banner.controller.js";

import {
  getAllCards,
  getCard,
  createCard,
  updateCard,
  deleteCard,
  setCardProducts,
} from "../controllers/marketing/promotionalCard.controller.js";

import {
  getFeaturedProducts,
  setFeaturedProducts,
  removeFeaturedProduct,
} from "../controllers/marketing/featuredProduct.controller.js";

import {
  getAllFlashSales,
  getFlashSale,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale,
  setFlashSaleProducts,
} from "../controllers/marketing/flashSale.controller.js";

import {
  getAllSections,
  updateSection,
} from "../controllers/marketing/homepageSection.controller.js";

import upload from "../middlewares/upload.middleware.js";

const router = Router();

/* ==========================================================
   SITE SETTINGS  (announcement bar, social links, etc.)
========================================================== */
router.get("/settings", getSiteSettings);
router.patch("/settings", updateSiteSettings);

/* ==========================================================
   HOMEPAGE BANNERS
========================================================== */
router.get("/banners", getAllBanners);
router.get("/banners/:id", getBanner);

router.post(
  "/banners",
  upload.fields([
    { name: "desktop_image", maxCount: 1 },
    { name: "mobile_image", maxCount: 1 },
  ]),
  createBanner
);
router.patch(
  "/banners/:id",
  upload.fields([
    { name: "desktop_image", maxCount: 1 },
    { name: "mobile_image", maxCount: 1 },
  ]),
  updateBanner
);

router.delete("/banners/:id", deleteBanner);
router.put("/banners/:id/products", setBannerProducts);

/* ==========================================================
   PROMOTIONAL CARDS
========================================================== */
router.get("/cards", getAllCards);
router.get("/cards/:id", getCard);
router.post("/cards", upload.single("image"), createCard);
router.patch("/cards/:id", upload.single("image"), updateCard);
router.delete("/cards/:id", deleteCard);
router.put("/cards/:id/products", setCardProducts);

/* ==========================================================
   FEATURED PRODUCTS
========================================================== */
router.get("/featured-products", getFeaturedProducts);
router.put("/featured-products", setFeaturedProducts);
router.delete("/featured-products/:id", removeFeaturedProduct);

/* ==========================================================
   FLASH SALES
========================================================== */
router.get("/flash-sales", getAllFlashSales);
router.get("/flash-sales/:id", getFlashSale);
router.post("/flash-sales", upload.single("banner_image"), createFlashSale);
router.patch(
  "/flash-sales/:id",
  upload.single("banner_image"),
  updateFlashSale
);
router.delete("/flash-sales/:id", deleteFlashSale);
router.put("/flash-sales/:id/products", setFlashSaleProducts);

/* ==========================================================
   HOMEPAGE SECTIONS
========================================================== */
router.get("/sections", getAllSections);
router.patch("/sections/:name", updateSection);

export default router;
