import pool from "../config/db.js";

// Ensure phone_verifications table exists
export const initPhoneVerificationTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS phone_verifications (
        verification_id INT AUTO_INCREMENT PRIMARY KEY,
        phone VARCHAR(20) NOT NULL,
        otp_code VARCHAR(10) NOT NULL,
        expires_at DATETIME NOT NULL,
        verified_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_phone_otp (phone, otp_code, expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.error("Error initializing phone_verifications table:", err.message);
  }
};

export const createPhoneVerification = async ({ phone, otpCode, expiresAt }) => {
  await initPhoneVerificationTable();
  const cleanPhone = String(phone).trim().replace(/\D/g, "");
  
  // Invalidate any previous unused OTPs for this phone
  await pool.query(
    `DELETE FROM phone_verifications WHERE phone = ? AND verified_at IS NULL`,
    [cleanPhone]
  );

  const [result] = await pool.query(
    `INSERT INTO phone_verifications (phone, otp_code, expires_at) VALUES (?, ?, ?)`,
    [cleanPhone, otpCode.trim(), expiresAt]
  );
  return result;
};

export const verifyPhoneOtp = async ({ phone, otpCode }) => {
  await initPhoneVerificationTable();
  const cleanPhone = String(phone).trim().replace(/\D/g, "");
  const cleanOtp = String(otpCode).trim();

  const [rows] = await pool.query(
    `SELECT * FROM phone_verifications 
     WHERE phone = ? AND otp_code = ? AND expires_at > NOW() AND verified_at IS NULL
     ORDER BY verification_id DESC LIMIT 1`,
    [cleanPhone, cleanOtp]
  );

  if (!rows || rows.length === 0) {
    return { valid: false, message: "Invalid or expired mobile verification code." };
  }

  const record = rows[0];

  // Mark as verified
  await pool.query(
    `UPDATE phone_verifications SET verified_at = NOW() WHERE verification_id = ?`,
    [record.verification_id]
  );

  return { valid: true, record };
};

export const isPhoneVerified = async (phone) => {
  await initPhoneVerificationTable();
  const cleanPhone = String(phone).trim().replace(/\D/g, "");
  
  // Check if verified recently (within last 30 minutes)
  const [rows] = await pool.query(
    `SELECT * FROM phone_verifications 
     WHERE phone = ? AND verified_at IS NOT NULL AND verified_at >= NOW() - INTERVAL 30 MINUTE
     ORDER BY verification_id DESC LIMIT 1`,
    [cleanPhone]
  );

  return rows && rows.length > 0;
};
