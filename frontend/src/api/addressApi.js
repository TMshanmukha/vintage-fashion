import api from "./API";

// GET /api/addresses
export const getAddresses = async () => {
  const res = await api.get("/addresses");
  return res.data;
};

// POST /api/addresses
export const addAddress = async (data) => {
  const res = await api.post("/addresses", data);
  return res.data;
};

export default api;
