import axios from "axios";

const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";

// Token cached in-memory. Shiprocket tokens are valid ~10 days, so a
// simple module-level cache (reset on server restart) is sufficient —
// no need for Redis/DB storage for a single-instance backend.
let cachedToken = null;
let tokenExpiresAt = null;

async function authenticate() {
  const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD,
  });

  cachedToken = response.data.token;
  // Shiprocket doesn't return an explicit expiry — refresh proactively
  // every 9 days to stay safely under their ~10 day token lifetime.
  tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;

  return cachedToken;
}

async function getToken() {
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }
  return authenticate();
}

// Shared axios instance — every service function imports this instead
// of raw axios, so auth header + base URL are never duplicated.
const shiprocketApi = axios.create({
  baseURL: SHIPROCKET_BASE_URL,
});

shiprocketApi.interceptors.request.use(async (config) => {
  const token = await getToken();
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If a call fails with 401 (token invalidated server-side, not just
// expired), force a fresh login and retry once.
shiprocketApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      cachedToken = null;
      const token = await authenticate();
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return shiprocketApi(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default shiprocketApi;
