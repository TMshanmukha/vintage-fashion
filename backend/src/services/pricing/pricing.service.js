import pool from "../../config/db.js";

// Returns the single best-priority active promotion for a product, or null.
// This is the ONLY function in the codebase allowed to decide what a
// product's discount is.
export async function resolvePromotionForProduct(productId) {
  const [rows] = await pool.query(
    `
    SELECT pr.*
    FROM promotions pr
    LEFT JOIN promotion_products pp
      ON pp.promotion_id = pr.promotion_id AND pp.product_id = ?
    JOIN products prod ON prod.product_id = ?
    WHERE pr.is_active = TRUE
      AND (pr.start_date IS NULL OR pr.start_date <= NOW())
      AND (pr.end_date IS NULL OR pr.end_date >= NOW())
      AND (
        pp.product_id IS NOT NULL
        OR pr.applicable_category_id = prod.category_id
      )
    ORDER BY pr.priority DESC, pr.promotion_id DESC
    LIMIT 1
    `,
    [productId, productId]
  );
  return rows[0] || null;
}

// Batch version for product listing pages — avoids N+1 queries.
export async function resolvePromotionsForProducts(productIds) {
  if (!productIds.length) return {};

  const [rows] = await pool.query(
    `
    SELECT prod.product_id, pr.*
    FROM products prod
    JOIN promotions pr
      ON pr.is_active = TRUE
      AND (pr.start_date IS NULL OR pr.start_date <= NOW())
      AND (pr.end_date IS NULL OR pr.end_date >= NOW())
      AND (
        pr.promotion_id IN (
          SELECT promotion_id FROM promotion_products WHERE product_id = prod.product_id
        )
        OR pr.applicable_category_id = prod.category_id
      )
    WHERE prod.product_id IN (?)
    ORDER BY prod.product_id, pr.priority DESC, pr.promotion_id DESC
    `,
    [productIds]
  );

  // Keep only the highest-priority promotion per product (first row per group)
  const byProduct = {};
  for (const row of rows) {
    if (!byProduct[row.product_id]) byProduct[row.product_id] = row;
  }
  return byProduct;
}

// Pure calculation — given a base price and a promotion, compute the shape
// every API response should share.
export function applyPromotion(basePrice, promotion) {
  const original_price = Number(basePrice);

  if (!promotion) {
    return {
      original_price,
      discount_percent: 0,
      discount_amount: 0,
      final_price: original_price,
      promotion_id: null,
      promotion_type: null,
    };
  }

  const discount_amount =
    promotion.discount_type === "PERCENTAGE"
      ? +(original_price * (Number(promotion.discount_value) / 100)).toFixed(2)
      : Math.min(Number(promotion.discount_value), original_price);

  const discount_percent =
    promotion.discount_type === "PERCENTAGE"
      ? Number(promotion.discount_value)
      : +((discount_amount / original_price) * 100).toFixed(2);

  return {
    original_price,
    discount_percent,
    discount_amount,
    final_price: +(original_price - discount_amount).toFixed(2),
    promotion_id: promotion.promotion_id,
    promotion_type: promotion.promotion_type,
  };
}