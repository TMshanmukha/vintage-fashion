import { z } from "zod";

/* ==========================================================
   SITE SETTINGS
========================================================== */

export const updateSiteSettingsSchema = z.object({
  announcement_text: z
    .string()
    .trim()
    .max(255, "Announcement cannot exceed 255 characters")
    .nullable()
    .optional(),

  announcement_enabled: z.boolean().optional(),
});

/* ==========================================================
   HOMEPAGE SECTIONS
========================================================== */

export const updateHomepageSectionSchema = z.object({
  section_name: z
    .string()
    .trim()
    .min(1)
    .max(50),

  display_order: z.coerce
    .number()
    .int()
    .min(1),

  is_enabled: z.boolean(),
});

/* ==========================================================
   HERO BANNER
========================================================== */

export const bannerSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3)
    .max(150),

  subtitle: z
    .string()
    .trim()
    .max(255)
    .nullable()
    .optional(),

  description: z
    .string()
    .trim()
    .max(1000)
    .nullable()
    .optional(),

  desktop_image_url: z.string().trim().url(),

    desktop_image_public_id: z
    .string()
    .trim()
    .optional()
    .nullable(),

    mobile_image_url: z
    .string()
    .trim()
    .url()
    .optional()
    .nullable(),

    mobile_image_public_id: z
    .string()
    .trim()
    .optional()
    .nullable(),

  button_text: z
    .string()
    .trim()
    .max(50)
    .nullable()
    .optional(),

  button_link: z
    .string()
    .trim()
    .max(255)
    .nullable()
    .optional(),

  display_order: z.coerce
    .number()
    .int()
    .min(1)
    .optional(),

  status: z.enum([
        "ACTIVE",
        "INACTIVE",
        "SCHEDULED",
        ]).optional(),

  start_date: z.string().datetime().nullable().optional(),

  end_date: z.string().datetime().nullable().optional(),
});

/* ==========================================================
   PROMOTIONAL CARD
========================================================== */

export const promotionalCardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2)
    .max(120),

  subtitle: z
    .string()
    .trim()
    .max(200)
    .nullable()
    .optional(),

  image_url: z
    .string()
    .trim()
    .url(),
  
  image_public_id: z
    .string()
    .trim()
    .optional()
    .nullable(),

  button_text: z
    .string()
    .trim()
    .max(50)
    .nullable()
    .optional(),

  button_link: z
    .string()
    .trim()
    .max(255)
    .nullable()
    .optional(),

  display_order: z.coerce
    .number()
    .int()
    .min(1),

  is_active: z.preprocess(
    (value) => {
        if (value === "true") return true;
        if (value === "false") return false;
        return value;
    },
    z.boolean().optional()
    ),
});

/* ==========================================================
   FEATURED PRODUCTS
========================================================== */

export const featuredProductsSchema = z.object({
  product_ids: z
    .array(
      z.coerce
        .number()
        .int()
        .positive()
    )
    .min(1),
});

/* ==========================================================
   FLASH SALE
========================================================== */

export const flashSaleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3)
    .max(150),

  description: z
    .string()
    .trim()
    .max(1000)
    .nullable()
    .optional(),

  badge: z
    .string()
    .trim()
    .max(50)
    .nullable()
    .optional(),

  discount_type: z.enum([
    "PERCENTAGE",
    "FIXED",
  ]),

  discount_value: z.coerce
    .number()
    .positive(),

  banner_image: z
    .string()
    .trim()
    .url()
    .nullable()
    .optional(),

  button_text: z
    .string()
    .trim()
    .max(50)
    .nullable()
    .optional(),

  button_link: z
    .string()
    .trim()
    .max(255)
    .nullable()
    .optional(),

  start_date: z.string().min(1),

  end_date: z.string().min(1),

  is_active: z.boolean().optional(),
});

/* ==========================================================
   FLASH SALE PRODUCTS
========================================================== */

export const flashSaleProductsSchema = z.object({
  product_ids: z
    .array(
      z.coerce
        .number()
        .int()
        .positive() 
    )
    
});

export const updateWebsiteSettingsSchema = z.object({
  announcement_text: z
    .string()
    .trim()
    .max(255)
    .optional(),

  announcement_enabled: z
    .boolean()
    .optional(),

  support_phone: z
    .string()
    .trim()
    .max(20)
    .optional(),

  support_email: z
    .string()
    .trim()
    .email()
    .max(150)
    .optional(),

  currency: z
    .string()
    .trim()
    .max(10)
    .optional(),

  language: z
    .string()
    .trim()
    .max(20)
    .optional(),

  facebook_url: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal("")),

  instagram_url: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal("")),

  twitter_url: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal("")),

  youtube_url: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal("")),

  copyright_text: z
    .string()
    .trim()
    .max(255)
    .optional(),
});