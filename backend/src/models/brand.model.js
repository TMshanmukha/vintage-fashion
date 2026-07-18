import pool from "../config/db.js";

export const getBrands = async ({ search, limit, offset }) => {
  let sql = `
    SELECT
      brand_id, name, slug, logo_url, description,
      is_active, created_at, updated_at
    FROM brands
    WHERE 1 = 1
  `;
  const values = [];

  if (search) {
    sql += ` AND name LIKE ? `;
    values.push(`%${search}%`);
  }

  sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ? `;
  values.push(limit, offset);

  const [rows] = await pool.query(sql, values);
  return rows;
};

export const countBrands = async ({ search }) => {
  let sql = `SELECT COUNT(*) AS total FROM brands WHERE 1 = 1`;
  const values = [];

  if (search) {
    sql += ` AND name LIKE ? `;
    values.push(`%${search}%`);
  }

  const [rows] = await pool.query(sql, values);
  return rows[0].total;
};

export const getBrandBySlug = async (slug, connection = pool) => {
  const [rows] = await connection.query(
    `
    SELECT
      brand_id, name, slug, logo_url, description,
      is_active, created_at, updated_at
    FROM brands
    WHERE slug = ?
    LIMIT 1
    `,
    [slug]
  );
  return rows[0];
};

// Signature kept single-arg-compatible — product.service.js calls
// getBrandById(product.brand_id) with no connection.
export const getBrandById = async (brandId, connection = pool) => {
  const [rows] = await connection.query(
    `
    SELECT
      brand_id, name, slug, logo_url, description,
      is_active, created_at, updated_at
    FROM brands
    WHERE brand_id = ?
    LIMIT 1
    `,
    [brandId]
  );
  return rows[0];
};

export const createBrand = async (brand, connection = pool) => {
  const [result] = await connection.query(
    `
    INSERT INTO brands (name, slug, logo_url, description, is_active)
    VALUES (?, ?, ?, ?, TRUE)
    `,
    [brand.name, brand.slug, brand.logo_url || null, brand.description || null]
  );
  return result.insertId;
};

export const updateBrand = async (brand, connection = pool) => {
  const [result] = await connection.query(
    `
    UPDATE brands
    SET
      name = ?,
      slug = ?,
      logo_url = ?,
      description = ?,
      is_active = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE brand_id = ?
    `,
    [
      brand.name,
      brand.slug,
      brand.logo_url,
      brand.description,
      brand.is_active,
      brand.brand_id
    ]
  );
  return result;
};

export const softDeleteBrand = async (brandId, connection = pool) => {
  const [result] = await connection.query(
    `
    UPDATE brands
    SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
    WHERE brand_id = ?
    `,
    [brandId]
  );
  return result;
};