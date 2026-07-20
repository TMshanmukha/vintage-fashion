import pool from "../../config/db.js";

export async function getAllSections() {
  const [rows] = await pool.query(
    `
    SELECT section_id, section_name, display_order, is_enabled, updated_at
    FROM homepage_sections
    ORDER BY display_order ASC
    `
  );
  return rows;
}

export async function updateSectionByName(sectionName, is_enabled) {
  const [result] = await pool.query(
    `UPDATE homepage_sections SET is_enabled = ? WHERE section_name = ?`,
    [is_enabled, sectionName]
  );
  return result;
}
