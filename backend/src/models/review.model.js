import pool from "../config/db.js";

export const getReviewsByProduct = async (productId) => {
  const [rows] = await pool.query(
    `SELECT review_id, product_id, user_id, user_name, rating, title, comment, created_at
     FROM reviews
     WHERE product_id = ?
     ORDER BY created_at DESC`,
    [productId]
  );
  return rows;
};

export const getReviewsSummary = async (productId) => {
  const [rows] = await pool.query(
    `SELECT 
       COUNT(*) as total_reviews,
       COALESCE(AVG(rating), 0) as average_rating
     FROM reviews
     WHERE product_id = ?`,
    [productId]
  );
  return {
    total_reviews: Number(rows[0]?.total_reviews || 0),
    average_rating: Number(Number(rows[0]?.average_rating || 0).toFixed(1)),
  };
};

export const createReview = async ({ productId, userId, userName, rating, title, comment }) => {
  const [result] = await pool.query(
    `INSERT INTO reviews (product_id, user_id, user_name, rating, title, comment)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [productId, userId, userName, Number(rating), title || "", comment]
  );

  // Sync review_count & average_rating on products table if available
  try {
    const summary = await getReviewsSummary(productId);
    await pool.query(
      `UPDATE products 
       SET review_count = ?, average_rating = ?
       WHERE product_id = ?`,
      [summary.total_reviews, summary.average_rating, productId]
    );
  } catch (err) {
    console.error("Failed to update product review stats:", err);
  }

  return result;
};

export const deleteReviewById = async (reviewId) => {
  // Get product_id first to sync stats
  const [existing] = await pool.query(
    `SELECT product_id FROM reviews WHERE review_id = ?`,
    [reviewId]
  );
  const productId = existing[0]?.product_id;

  const [result] = await pool.query(
    `DELETE FROM reviews WHERE review_id = ?`,
    [reviewId]
  );

  if (productId) {
    try {
      const summary = await getReviewsSummary(productId);
      await pool.query(
        `UPDATE products 
         SET review_count = ?, average_rating = ?
         WHERE product_id = ?`,
        [summary.total_reviews, summary.average_rating, productId]
      );
    } catch (err) {
      console.error("Failed to update product review stats after delete:", err);
    }
  }

  return result;
};

export const getAllReviewsForAdmin = async ({ search = "", page = 1, limit = 50 }) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
  const offset = (pageNum - 1) * limitNum;

  let query = `
    SELECT 
      r.review_id,
      r.product_id,
      r.user_id,
      r.user_name,
      u.email as user_email,
      r.rating,
      r.title,
      r.comment,
      r.created_at,
      p.name as product_name,
      p.slug as product_slug,
      (SELECT image_url FROM product_images pi WHERE pi.product_id = p.product_id ORDER BY is_primary DESC, image_id ASC LIMIT 1) as product_image
    FROM reviews r
    LEFT JOIN products p ON r.product_id = p.product_id
    LEFT JOIN users u ON r.user_id = u.user_id
  `;

  const params = [];
  if (search && search.trim()) {
    query += ` WHERE (r.user_name LIKE ? OR r.comment LIKE ? OR r.title LIKE ? OR p.name LIKE ? OR u.email LIKE ?)`;
    const s = `%${search.trim()}%`;
    params.push(s, s, s, s, s);
  }

  query += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
  params.push(limitNum, offset);

  const [rows] = await pool.query(query, params);

  // Total count
  let countQuery = `
    SELECT COUNT(*) as total
    FROM reviews r
    LEFT JOIN products p ON r.product_id = p.product_id
    LEFT JOIN users u ON r.user_id = u.user_id
  `;
  const countParams = [];
  if (search && search.trim()) {
    countQuery += ` WHERE (r.user_name LIKE ? OR r.comment LIKE ? OR r.title LIKE ? OR p.name LIKE ? OR u.email LIKE ?)`;
    const s = `%${search.trim()}%`;
    countParams.push(s, s, s, s, s);
  }

  const [countRows] = await pool.query(countQuery, countParams);
  const total = Number(countRows[0]?.total || 0);

  return {
    reviews: rows || [],
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  };
};
