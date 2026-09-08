import pool from "../../config/db.js";

/* ==========================================================
   GET ALL CARDS
========================================================== */
export async function getAllCards() {
  const [rows] = await pool.query(
    `
    SELECT
      card_id,
      title,
      subtitle,
      image_url,
      button_text,
      button_link,
      display_order,
      is_active,
      badge,
      created_at,
      updated_at
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
    `
    SELECT *
    FROM promotional_cards
    WHERE card_id = ?
    LIMIT 1
    `,
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
    badge,
  } = data;

  const [result] = await pool.query(
    `
    INSERT INTO promotional_cards (
      title,
      subtitle,
      image_url,
      image_public_id,
      button_text,
      button_link,
      display_order,
      is_active,
      badge
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      title,
      subtitle || null,
      image_url,
      image_public_id,
      button_text || "Shop Now",
      button_link || "/shop",
      display_order || 1,
      is_active ?? true,
      badge ?? null,
    ]
  );

  return result.insertId;
}

/* ==========================================================
   UPDATE CARD
========================================================== */
export async function updateCard(cardId, data) {
  const fields = Object.keys(data);

  if (fields.length === 0) {
    return getCardById(cardId);
  }

  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const values = fields.map((field) => data[field]);
  values.push(cardId);

  await pool.query(
    `
    UPDATE promotional_cards
    SET ${setClause}
    WHERE card_id = ?
    `,
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

/* ==========================================================
   GET PRODUCTS ATTACHED TO A CARD
========================================================== */
export async function getCardProducts(cardId) {
  const [rows] = await pool.query(
    `
    SELECT
      p.product_id,
      p.name AS product_name,
      p.slug,
      p.price,
      p.original_price,
      p.badge,
      pi.image_url
    FROM promotional_card_products pcp
    JOIN products p ON p.product_id = pcp.product_id
    LEFT JOIN product_images pi
      ON pi.product_id = p.product_id
      AND pi.is_primary = TRUE
    WHERE pcp.card_id = ?
    `,
    [cardId]
  );
  return rows;
}

/* ==========================================================
   REPLACE PRODUCTS ATTACHED TO A CARD
========================================================== */
export async function setCardProducts(cardId, productIds) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `DELETE FROM promotional_card_products WHERE card_id = ?`,
      [cardId]
    );

    if (productIds.length > 0) {
      const values = productIds.map((id) => [cardId, id]);
      await conn.query(
        `INSERT INTO promotional_card_products (card_id, product_id) VALUES ?`,
        [values]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
