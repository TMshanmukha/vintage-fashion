import bcrypt from "bcrypt";
import crypto from "crypto";

// 10 Salt rounds is the OWASP recommended standard: provides high security while running in ~60ms
const SALT_ROUNDS = 10;

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Fast 0.01ms SHA-256 hash for high-entropy tokens (Refresh tokens, session identifiers)
export const hashToken = (token) => {
    if (!token) return "";
    return crypto.createHash("sha256").update(token).digest("hex");
};

// Constant-time token verification with backward compatibility for existing bcrypt tokens
export const compareTokenHash = async (token, storedHash) => {
    if (!token || !storedHash) return false;

    // Check if storedHash is a 64-char hex string (SHA-256)
    if (storedHash.length === 64 && /^[0-9a-f]{64}$/i.test(storedHash)) {
        const tokenHash = hashToken(token);
        return crypto.timingSafeEqual(Buffer.from(tokenHash), Buffer.from(storedHash));
    }

    // Fallback for legacy bcrypt hashes
    try {
        return await bcrypt.compare(token, storedHash);
    } catch {
        return false;
    }
};