import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true
});

// Signup
export const signup = async (userData) => {
    const response = await API.post("/auth/signup", userData);
    return response.data;
};

// Login
export const login = async (userData) => {
    const response = await API.post("/auth/login", userData);
    return response.data;
};

// Refresh Access Token
export const refreshToken = async () => {
    const response = await API.post("/auth/refresh");
    return response.data;
};

// Logout
export const logout = async () => {
    const response = await API.post("/auth/logout");
    return response.data;
};

export const forgotPassword = async (email) => {

    const response = await API.post(
        "/auth/forgot-password",
        {
            email
        }
    );
    return response.data;
};

export const resetPassword = async (data) => {

    const response = await API.post(
        "/auth/reset-password",
        data
    );
    return response.data;
};

export default API;