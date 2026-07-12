import jwt from "jsonwebtoken";

/**
 * Generate Access Token
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(
        payload,
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
        }
    );
};

/**
 * Generate Refresh Token
 */
export const generateRefreshToken = (payload) => {
    return jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
        }
    );
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token) => {
    return jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET
    );
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token) => {
    return jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET
    );
};