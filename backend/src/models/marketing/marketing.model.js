import pool from "../../config/db.js";

/* ==========================================================
   WEBSITE SETTINGS
========================================================== */

export async function getWebsiteSettings() {
  const [rows] = await pool.query(
    `
    SELECT
      setting_id,
      announcement_text,
      announcement_enabled,
      support_phone,
      support_email,
      currency,
      language,
      facebook_url,
      instagram_url,
      twitter_url,
      youtube_url,
      copyright_text,
      created_at,
      updated_at
    FROM website_settings
    WHERE setting_id = 1
    LIMIT 1
    `
  );

  return rows[0];
}

export async function updateWebsiteSettings(data) {

  const fields = Object.keys(data);

  if (fields.length === 0) {
    return;
  }

  const setClause = fields
    .map(field => `${field} = ?`)
    .join(", ");

  const values = fields.map(field => data[field]);

  values.push(1);

  const [result] = await pool.query(
    `
    UPDATE website_settings
    SET ${setClause}
    WHERE setting_id = ?
    `,
    values
  );

  return result;
}