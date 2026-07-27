import axios from "axios";

let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
};

export const attachAuthInterceptors = (api) => {

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("adminAccessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      const isAuthError = error.response?.status === 401;
      const isRefreshCall = originalRequest?.url?.includes("/auth/refresh");
      const isLoginCall = originalRequest?.url?.includes("/auth/login");

      if (!isAuthError || isRefreshCall || isLoginCall || originalRequest._retry) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post(
          "http://localhost:5000/api/auth/refresh",
          {},
          { withCredentials: true }
        );

        const newToken = res.data.data.accessToken;
        localStorage.setItem("adminAccessToken", newToken);

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);

        localStorage.removeItem("adminAccessToken");
        localStorage.removeItem("admin");
        window.location.href = "/admin";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );

};