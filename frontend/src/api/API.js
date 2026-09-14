import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "./apiBaseUrl";

const API = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

// Attach Customer Access Token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });
    failedQueue = [];
};

const handleUserSessionExpiration = () => {
    const hadUser = Boolean(localStorage.getItem("user") || localStorage.getItem("accessToken"));
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");

    const isProtectedRoute = window.location.pathname.startsWith("/account") ||
                             window.location.pathname.startsWith("/checkout") ||
                             window.location.pathname.startsWith("/wishlist");

    if (hadUser && isProtectedRoute && window.location.pathname !== "/auth") {
        toast.error("Session expired. Please sign in again.", { id: "user-session-expired" });
        window.location.href = "/auth";
    }
};

// Handle Expired Customer Token
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isAuthError = error.response?.status === 401;
        const isAuthRoute =
            originalRequest?.url?.includes("/auth/login") ||
            originalRequest?.url?.includes("/auth/signup") ||
            originalRequest?.url?.includes("/auth/refresh") ||
            originalRequest?.url?.includes("/auth/forgot-password") ||
            originalRequest?.url?.includes("/auth/reset-password");

        if (isAuthError && !isAuthRoute) {
            const hasUserSession = Boolean(
                localStorage.getItem("accessToken") || localStorage.getItem("user")
            );

            if (!hasUserSession) {
                handleUserSessionExpiration();
                const expiredErr = new Error("Session expired. Please sign in again.");
                expiredErr.isAuthExpired = true;
                expiredErr.response = error.response || { status: 401, data: { message: "Session expired. Please sign in again." } };
                return Promise.reject(expiredErr);
            }

            if (!originalRequest?._retry) {
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return API(originalRequest);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const response = await axios.post(
                        `${API_BASE_URL}/auth/refresh`,
                        {},
                        { withCredentials: true }
                    );

                    const newToken = response.data?.data?.accessToken;

                    if (newToken) {
                        localStorage.setItem("accessToken", newToken);
                        processQueue(null, newToken);
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return API(originalRequest);
                    }
                } catch (refreshError) {
                    const expiredErr = new Error("Session expired. Please sign in again.");
                    expiredErr.isAuthExpired = true;
                    expiredErr.response = { status: 401, data: { message: "Session expired. Please sign in again." } };

                    processQueue(expiredErr, null);
                    handleUserSessionExpiration();
                    return Promise.reject(expiredErr);
                } finally {
                    isRefreshing = false;
                }
            }
        }

        return Promise.reject(error);
    }
);

export default API;
