import api from "./API";
import { cachedAxiosGet } from "../utils/apiCache";

// GET /api/settings — public
export const getSettings = async () => {
  const res = await cachedAxiosGet(api, "/settings");
  return res.data; // { success, message, data }
};

export default api;
