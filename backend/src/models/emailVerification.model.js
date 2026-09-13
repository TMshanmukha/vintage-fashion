import pool from "../config/db.js";

// Ensure email_verifications table exists
export const initEmailVerificationTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        verification_id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp_code VARCHAR(10) NOT NULL,
        expires_at DATETIME NOT NULL,
        verified_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email_otp (email, otp_code, expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.error("Error initializing email_verifications table:", err.message);
  }
};

export const createEmailVerification = async ({ email, otpCode, expiresAt }) => {
  await initEmailVerificationTable();
  // Invalidate any previous unused OTPs for this email
  await pool.query(
    `DELETE FROM email_verifications WHERE email = ? AND verified_at IS NULL`,
    [email.toLowerCase().trim()]
  );

  const [result] = await pool.query(
    `INSERT INTO email_verifications (email, otp_code, expires_at) VALUES (?, ?, ?)`,
    [email.toLowerCase().trim(), otpCode.trim(), expiresAt]
  );
  return result;
};

export const verifyEmailOtp = async ({ email, otpCode }) => {
  await initEmailVerificationTable();
  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = String(otpCode).trim();

  const [rows] = await pool.query(
    `SELECT * FROM email_verifications 
     WHERE email = ? AND otp_code = ? AND expires_at > NOW() AND verified_at IS NULL
     ORDER BY verification_id DESC LIMIT 1`,
    [cleanEmail, cleanOtp]
  );

  if (!rows || rows.length === 0) {
    return { valid: false, message: "Invalid or expired verification code." };
  }

  const record = rows[0];

  // Mark as verified
  await pool.query(
    `UPDATE email_verifications SET verified_at = NOW() WHERE verification_id = ?`,
    [record.verification_id]
  );

  return { valid: true, record };
};
