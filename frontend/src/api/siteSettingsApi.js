import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true
});

export const getSiteSettings = () => API.get("/admin/marketing/settings");

export const updateSiteSettings = (data) =>
  API.patch("/admin/marketing/settings", data);
