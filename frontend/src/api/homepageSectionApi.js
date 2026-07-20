import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true
});

export const getSections = () => API.get("/admin/marketing/sections");

export const toggleSection = (sectionName, isEnabled) =>
  API.patch(`/admin/marketing/sections/${sectionName}`, {
    is_enabled: isEnabled,
  });
