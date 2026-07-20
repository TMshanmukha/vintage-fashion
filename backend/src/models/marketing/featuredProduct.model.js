import pool from "../../config/db.js";

/* ==========================================================
   GET ALL FEATURED PRODUCTS (joined with real product schema)
========================================================== */
export async function getAllFeatured() {
  const [rows] = await pool.query(
    `
    SELECT
      f.featured_id,
      f.product_id,
      f.display_order,
      f.is_active,
      f.created_at,
      p.name AS product_name,
      p.price,
      pi.image_url
    FROM featured_products f
    JOIN products p ON p.product_id = f.product_id
    LEFT JOIN product_images pi
      ON pi.product_id = p.product_id
      AND pi.is_primary = TRUE
    ORDER BY f.display_order ASC, f.featured_id DESC
    `
  );
  return rows;
}

/* ==========================================================
   REPLACE FEATURED PRODUCT LIST
========================================================== */
export async function setFeaturedProducts(productIds) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(`DELETE FROM featured_products`);

    if (productIds.length > 0) {
      const values = productIds.map((id, index) => [id, index + 1, true]);
      await conn.query(
        `INSERT INTO featured_products (product_id, display_order, is_active) VALUES ?`,
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

/* ==========================================================
   REMOVE A SINGLE FEATURED PRODUCT
========================================================== */
export async function removeFeatured(featuredId) {
  const [result] = await pool.query(
    `DELETE FROM featured_products WHERE featured_id = ?`,
    [featuredId]
  );
  return result;
}