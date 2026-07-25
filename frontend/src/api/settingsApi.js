import api from "./API";

// GET /api/settings — public
export const getSettings = async () => {
  const res = await api.get("/settings");
  return res.data; // { success, message, data }
};

export default api;
