import {
    getWebsiteSettings,
    updateWebsiteSettings,
} from "../../models/marketing/marketing.model.js";

/* ==========================================================
   WEBSITE SETTINGS
========================================================== */

export async function getWebsiteSettingsService() {
    return await getWebsiteSettings();
}

export async function updateWebsiteSettingsService(data) {
    await updateWebsiteSettings(data);

    return await getWebsiteSettings();
}