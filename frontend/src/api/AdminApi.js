import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE_URL } from "./apiBaseUrl";

const API = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

// Attach access token
API.interceptors.request.use((config) => {

    const token = localStorage.getItem("adminAccessToken");

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

// Handle expired access token
API.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        const hasAdminSession = Boolean(
            localStorage.getItem("adminAccessToken") || localStorage.getItem("admin")
        );

        if (
            error.response?.status === 401 &&
            !originalRequest?._retry &&
            hasAdminSession &&
            !originalRequest?.url?.includes("/auth/admin/login") &&
            !originalRequest?.url?.includes("/auth/admin/refresh")
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve,
                        reject
                    });
                }).then((token) => {
                    originalRequest.headers.Authorization =
                        `Bearer ${token}`;
                    return API(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axios.post(
                    `${API_BASE_URL}/auth/admin/refresh`,
                    {},
                    {
                        withCredentials: true
                    }
                );

                const newToken =
                    response.data?.data?.accessToken;

                if (newToken) {
                    localStorage.setItem(
                        "adminAccessToken",
                        newToken
                    );

                    processQueue(null, newToken);

                    originalRequest.headers.Authorization =
                        `Bearer ${newToken}`;

                    return API(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);

                const hadAdmin = Boolean(localStorage.getItem("admin") || localStorage.getItem("adminAccessToken"));
                localStorage.removeItem("admin");
                localStorage.removeItem("adminAccessToken");

                if (hadAdmin && window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
                    window.location.href = "/admin";
                    toast.error(
                        "Your session has expired. Please log in again."
                    );
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default API;
