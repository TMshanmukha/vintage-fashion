import API from "./AdminApi";
import { cachedAxiosGet, invalidateCache } from "../utils/apiCache";

export const getSiteSettings = () => cachedAxiosGet(API, "/admin/marketing/settings");

export const updateSiteSettings = async (data) => {
    const res = await API.patch("/admin/marketing/settings", data);
    invalidateCache("settings");
    invalidateCache("marketing");
    return res;
};
