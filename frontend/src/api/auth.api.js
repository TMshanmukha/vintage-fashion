import API from "./API";

// Send OTP for Signup Email Verification
export const sendOtp = async ({ email, name }) => {
    const response = await API.post("/auth/send-otp", { email, name });
    return response.data;
};

// Verify OTP
export const verifyOtp = async ({ email, otp }) => {
    const response = await API.post("/auth/verify-otp", { email, otp });
    return response.data;
};

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