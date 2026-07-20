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
      display_order,
      status,
      start_date,
      end_date
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
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
        button_link,
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