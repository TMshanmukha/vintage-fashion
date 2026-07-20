import {
  getWebsiteSettingsService,
  updateWebsiteSettingsService,
} from "../../services/marketing/marketing.service.js";

import { updateWebsiteSettingsSchema } from "../../validators/marketing.validator.js";

/* ==========================================================
   GET SITE SETTINGS
========================================================== */

export async function getSiteSettings(req, res, next) {
  try {
    const settings = await getWebsiteSettingsService();

    return res.status(200).json({
      success: true,
      message: "Site settings fetched successfully.",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
}

/* ==========================================================
   UPDATE SITE SETTINGS
========================================================== */

export async function updateSiteSettings(req, res, next) {
  try {
    const validatedData =
      updateWebsiteSettingsSchema.parse(req.body); // <-- fixed: was updateWebsiteSettingsService.parse

    const settings =
      await updateWebsiteSettingsService(validatedData);

    return res.status(200).json({
      success: true,
      message: "Site settings updated successfully.",
      data: settings,
    });

  } catch (error) {
    next(error);
  }
}