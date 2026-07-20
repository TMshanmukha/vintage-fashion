import pool from "../../config/db.js";

/* ==========================================================
   GET ALL CARDS
========================================================== */
export async function getAllCards() {
  const [rows] = await pool.query(
    `
    SELECT
      card_id, title, subtitle, image_url, image_public_id,
      button_text, button_link, display_order, is_active,
      created_at, updated_at
    FROM promotional_cards
    ORDER BY display_order ASC, card_id DESC
    `
  );
  return rows;
}

/* ==========================================================
   GET CARD BY ID
========================================================== */
export async function getCardById(cardId) {
  const [rows] = await pool.query(
    `SELECT * FROM promotional_cards WHERE card_id = ? LIMIT 1`,
    [cardId]
  );
  return rows[0];
}

/* ==========================================================
   CREATE CARD
========================================================== */
export async function createCard(data) {
  const {
    title,
    subtitle,
    image_url,
    image_public_id,
    button_text,
    button_link,
    display_order,
    is_active,
  } = data;

  const [result] = await pool.query(
    `
    INSERT INTO promotional_cards (
      title, subtitle, image_url, image_public_id,
      button_text, button_link, display_order, is_active
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      title,
      subtitle ?? null,
      image_url,
      image_public_id ?? null,
      button_text ?? null,
      button_link ?? null,
      display_order,
      is_active ?? true,
    ]
  );

  return result.insertId;
}

/* ==========================================================
   UPDATE CARD
========================================================== */
export async function updateCard(cardId, data) {
  const fields = Object.keys(data);
  if (fields.length === 0) return getCardById(cardId);

  const setClause = fields.map((f) => `${f} = ?`).join(", ");
  const values = fields.map((f) => data[f]);
  values.push(cardId);

  await pool.query(
    `UPDATE promotional_cards SET ${setClause} WHERE card_id = ?`,
    values
  );

  return getCardById(cardId);
}

/* ==========================================================
   DELETE CARD
========================================================== */
export async function deleteCard(cardId) {
  const [result] = await pool.query(
    `DELETE FROM promotional_cards WHERE card_id = ?`,
    [cardId]
  );
  return result;
}
