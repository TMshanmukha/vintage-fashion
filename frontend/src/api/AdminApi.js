import axios from "axios";
import toast from "react-hot-toast";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
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

        if (
            error.response?.status === 401 &&
            !originalRequest._retry
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
                    "http://localhost:5000/api/auth/admin/refresh",
                    {},
                    {
                        withCredentials: true
                    }
                );

                const newToken =
                    response.data.data.accessToken;

                localStorage.setItem(
                    "adminAccessToken",
                    newToken
                );

                processQueue(null, newToken);

                originalRequest.headers.Authorization =
                    `Bearer ${newToken}`;

                return API(originalRequest);

            } catch (refreshError) {

                processQueue(refreshError, null);

                localStorage.removeItem("admin");
                localStorage.removeItem("adminAccessToken");

                window.location.href = "/admin";
                toast.error(
                    "Your session has expired. Please log in again."
                );

                return Promise.reject(refreshError);

            } finally {

                isRefreshing = false;

            }

        }

        return Promise.reject(error);

    }

);

export default API;