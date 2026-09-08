import API from "./AdminApi";
import { cachedAxiosGet, invalidateCache } from "../utils/apiCache";

export const getSections = () => cachedAxiosGet(API, "/admin/marketing/sections");

export const toggleSection = async (sectionName, isEnabled) => {
  const res = await API.patch(`/admin/marketing/sections/${sectionName}`, {
    is_enabled: isEnabled,
  });
  invalidateCache("sections");
  invalidateCache("marketing");
  return res;
};
