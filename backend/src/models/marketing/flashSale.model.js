import pool from "../../config/db.js";

export async function getAllFlashSales() {
  const [rows] = await pool.query(
    `
    SELECT
      flash_sale_id, title, description, badge, discount_type,
      discount_value, banner_image, button_text, button_link,
      start_date, end_date, is_active, created_at, updated_at
    FROM flash_sales
    ORDER BY created_at DESC
    `
  );
  return rows;
}

export async function getFlashSaleById(flashSaleId) {
  const [rows] = await pool.query(
    `SELECT * FROM flash_sales WHERE flash_sale_id = ? LIMIT 1`,
    [flashSaleId]
  );
  return rows[0];
}

export async function getFlashSaleProducts(flashSaleId) {
  const [rows] = await pool.query(
    `
    SELECT
      p.product_id,
      p.name AS product_name,
      p.slug,
      p.price,
      pi.image_url
    FROM flash_sale_products fsp
    JOIN products p ON p.product_id = fsp.product_id
    LEFT JOIN product_images pi
      ON pi.product_id = p.product_id
      AND pi.is_primary = TRUE
    WHERE fsp.flash_sale_id = ?
    `,
    [flashSaleId]
  );
  return rows;
}

export async function createFlashSale(data) {
  const {
    title, description, badge, discount_type, discount_value,
    banner_image, button_text, button_link, start_date, end_date, is_active,
  } = data;

  const [result] = await pool.query(
    `
    INSERT INTO flash_sales (
      title, description, badge, discount_type, discount_value,
      banner_image, button_text, button_link, start_date, end_date, is_active
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      title, description ?? null, badge ?? null, discount_type, discount_value,
      banner_image ?? null, button_text ?? null, button_link || "/shop",
      start_date, end_date, is_active ?? true,
    ]
  );

  return result.insertId;
}

export async function updateFlashSale(flashSaleId, data) {
  const fields = Object.keys(data);
  if (fields.length === 0) return getFlashSaleById(flashSaleId);

  const setClause = fields.map((f) => `${f} = ?`).join(", ");
  const values = fields.map((f) => data[f]);
  values.push(flashSaleId);

  await pool.query(
    `UPDATE flash_sales SET ${setClause} WHERE flash_sale_id = ?`,
    values
  );

  return getFlashSaleById(flashSaleId);
}

export async function deleteFlashSale(flashSaleId) {
  const [result] = await pool.query(
    `DELETE FROM flash_sales WHERE flash_sale_id = ?`,
    [flashSaleId]
  );
  return result;
}

export async function setFlashSaleProducts(flashSaleId, productIds) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `DELETE FROM flash_sale_products WHERE flash_sale_id = ?`,
      [flashSaleId]
    );

    if (productIds.length > 0) {
      const values = productIds.map((id) => [flashSaleId, id]);
      await conn.query(
        `INSERT INTO flash_sale_products (flash_sale_id, product_id) VALUES ?`,
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
