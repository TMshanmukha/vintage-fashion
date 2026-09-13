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

  if (search && String(search).trim()) {
    sql += ` AND (name LIKE ? OR slug LIKE ?) `;
    const term = `%${String(search).trim()}%`;
    values.push(term, term);
  }

  const numLimit = Math.max(1, parseInt(limit, 10) || 20);
  const numOffset = Math.max(0, parseInt(offset, 10) || 0);

  sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ? `;
  values.push(numLimit, numOffset);

  const [rows] = await pool.query(sql, values);
  return Array.isArray(rows) ? rows : [];
};

export const countBrands = async ({ search }) => {
  let sql = `SELECT COUNT(*) AS total FROM brands WHERE 1 = 1`;
  const values = [];

  if (search && String(search).trim()) {
    sql += ` AND (name LIKE ? OR slug LIKE ?) `;
    const term = `%${String(search).trim()}%`;
    values.push(term, term);
  }

  const [rows] = await pool.query(sql, values);
  return Number(rows?.[0]?.total ?? 0);
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