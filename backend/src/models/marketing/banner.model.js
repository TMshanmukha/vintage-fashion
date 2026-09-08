import pool from "../../config/db.js";

/* ==========================================================
   GET ALL BANNERS
========================================================== */
export async function getAllBanners() {
  const [rows] = await pool.query(
    `
    SELECT
      banner_id,
      title,
      subtitle,
      description,
      desktop_image_url,
      mobile_image_url,
      button_text,
      button_link,
      discount_percent,
      display_order,
      status,
      start_date,
      end_date,
      created_at,
      updated_at
    FROM homepage_banners
    ORDER BY display_order ASC, banner_id DESC
    `
  );

  return rows;
}

/* ==========================================================
   GET BANNER BY ID
========================================================== */
export async function getBannerById(bannerId) {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM homepage_banners
    WHERE banner_id = ?
    LIMIT 1
    `,
    [bannerId]
  );

  return rows[0];
}

/* ==========================================================
   CREATE BANNER
========================================================== */
export async function createBanner(data) {
  const {
    title,
    subtitle,
    description,
    desktop_image_url,
    desktop_image_public_id,
    mobile_image_url,
    mobile_image_public_id,
    button_text,
    button_link,
    discount_percent,
    display_order,
    status,
    start_date,
    end_date,
  } = data;

  const [result] = await pool.query(
    `
    INSERT INTO homepage_banners (
      title,
      subtitle,
      description,
      desktop_image_url,
      desktop_image_public_id,
      mobile_image_url,
      mobile_image_public_id,
      button_text,
      button_link,
      discount_percent,
      display_order,
      status,
      start_date,
      end_date
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      title,
      subtitle,
      description,
      desktop_image_url,
      desktop_image_public_id,
      mobile_image_url,
      mobile_image_public_id,
      button_text,
      button_link || "/shop",
      discount_percent ?? null,
      display_order,
      status,
      start_date,
      end_date,
    ]
  );

  return result.insertId;
}

/* ==========================================================
   UPDATE BANNER
========================================================== */
export async function updateBanner(bannerId, data) {
  const fields = Object.keys(data);

  if (fields.length === 0) return;

  const setClause = fields.map((field) => `${field} = ?`).join(", ");

  const values = fields.map((field) => data[field]);

  values.push(bannerId);

  await pool.query(
    `
    UPDATE homepage_banners
    SET ${setClause}
    WHERE banner_id = ?
    `,
    values
  );

  return getBannerById(bannerId);
}

/* ==========================================================
   DELETE BANNER
========================================================== */
export async function deleteBanner(bannerId) {
  const [result] = await pool.query(
    `
    DELETE FROM homepage_banners
    WHERE banner_id = ?
    `,
    [bannerId]
  );

  return result;
}

/* ==========================================================
   GET PRODUCTS ATTACHED TO A BANNER
========================================================== */
export async function getBannerProducts(bannerId) {
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
    FROM banner_products bp
    JOIN products p ON p.product_id = bp.product_id
    LEFT JOIN product_images pi
      ON pi.product_id = p.product_id
      AND pi.is_primary = TRUE
    WHERE bp.banner_id = ?
    `,
    [bannerId]
  );
  return rows;
}

/* ==========================================================
   REPLACE PRODUCTS ATTACHED TO A BANNER
========================================================== */
export async function setBannerProducts(bannerId, productIds) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `DELETE FROM banner_products WHERE banner_id = ?`,
      [bannerId]
    );

    if (productIds.length > 0) {
      const values = productIds.map((id) => [bannerId, id]);
      await conn.query(
        `INSERT INTO banner_products (banner_id, product_id) VALUES ?`,
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
