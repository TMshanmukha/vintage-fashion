import pool from "../config/db.js";

let initialized = false;

export const initSequencesTable = async () => {
  if (initialized) return;
  initialized = true;

  try {
    // 1. Sequences table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS business_sequences (
        sequence_key VARCHAR(50) PRIMARY KEY,
        prefix VARCHAR(20) NOT NULL,
        current_val BIGINT NOT NULL DEFAULT 1000,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Default sequence initializations
    const initialSequences = [
      { key: "order", prefix: "VF-ORD-", start: 1000 },
      { key: "user", prefix: "VF-USR-", start: 1000 },
      { key: "product", prefix: "VF-PRD-", start: 100 },
      { key: "return", prefix: "VF-RET-", start: 100 },
    ];

    for (const seq of initialSequences) {
      await pool.query(`
        INSERT IGNORE INTO business_sequences (sequence_key, prefix, current_val)
        VALUES (?, ?, ?)
      `, [seq.key, seq.prefix, seq.start]);
    }

    // 3. Add user_code to users table if missing
    try {
      await pool.query(`
        ALTER TABLE users ADD COLUMN user_code VARCHAR(50) NULL AFTER user_id
      `);
      console.log("Added user_code column to users table.");
    } catch (colErr) {
      // Column may already exist
    }

    // Backfill user_code for existing users if any are null
    const [unassignedUsers] = await pool.query(`
      SELECT user_id FROM users WHERE user_code IS NULL ORDER BY user_id ASC
    `);

    for (const u of unassignedUsers) {
      const code = await getNextSequence("user");
      await pool.query(`UPDATE users SET user_code = ? WHERE user_id = ?`, [code, u.user_id]);
    }
  } catch (err) {
    console.error("Error initializing business_sequences:", err.message);
  }
};

/**
 * Atomically increments and retrieves the next sequential code.
 * Example: getNextSequence('order') -> 'VF-ORD-1001'
 */
export async function getNextSequence(sequenceKey) {
  if (!initialized) {
    await initSequencesTable();
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Lock and fetch current sequence
    const [rows] = await connection.query(
      `SELECT sequence_key, prefix, current_val FROM business_sequences WHERE sequence_key = ? FOR UPDATE`,
      [sequenceKey]
    );

    let prefix = "VF-";
    let nextVal = 1001;

    if (rows && rows.length > 0) {
      prefix = rows[0].prefix;
      nextVal = Number(rows[0].current_val) + 1;
      await connection.query(
        `UPDATE business_sequences SET current_val = ? WHERE sequence_key = ?`,
        [nextVal, sequenceKey]
      );
    } else {
      prefix = `VF-${sequenceKey.toUpperCase().slice(0, 3)}-`;
      nextVal = 1001;
      await connection.query(
        `INSERT INTO business_sequences (sequence_key, prefix, current_val) VALUES (?, ?, ?)`,
        [sequenceKey, prefix, nextVal]
      );
    }

    await connection.commit();
    return `${prefix}${nextVal}`;
  } catch (err) {
    await connection.rollback();
    console.error(`Error generating sequence for ${sequenceKey}:`, err.message);
    const fallbackNumber = Math.floor(1000 + Math.random() * 9000);
    return `VF-${sequenceKey.toUpperCase().slice(0, 3)}-${fallbackNumber}`;
  } finally {
    connection.release();
  }
}
