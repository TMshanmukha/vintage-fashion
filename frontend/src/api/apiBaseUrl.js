// Vite reads VITE_* values from frontend/.env during local development.
// Production keeps using the deployed API when no override is provided.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://vintage-fashion.onrender.com/api";
