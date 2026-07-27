import API from "./AdminApi";

export const getSiteSettings = () => API.get("/admin/marketing/settings");

export const updateSiteSettings = (data) =>
    API.patch("/admin/marketing/settings", data);
