import API from "./AdminApi";

export const getSections = () => API.get("/admin/marketing/sections");

export const toggleSection = (sectionName, isEnabled) =>
  API.patch(`/admin/marketing/sections/${sectionName}`, {
    is_enabled: isEnabled,
  });
