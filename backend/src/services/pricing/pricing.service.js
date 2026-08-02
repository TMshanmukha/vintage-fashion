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
// Fixed: MySQL doesn't allow a correlated subquery inside an ON clause
// ("ON condition doesn't support subqueries yet"). Replaced the
// IN (SELECT ... WHERE product_id = prod.product_id) with a real JOIN.
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
    LEFT JOIN promotion_products pp
      ON pp.promotion_id = pr.promotion_id AND pp.product_id = prod.product_id
    WHERE prod.product_id IN (?)
      AND (
        pp.product_id IS NOT NULL
        OR pr.applicable_category_id = prod.category_id
      )
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
export function applyPromotion(price, originalPrice, promotion) {

    const sellingPrice = Number(price);
    const mrp = Number(originalPrice ?? price);

    if (!promotion) {
        return {
            original_price: mrp,
            final_price: sellingPrice,
            discount_percent: 0,
            discount_amount: 0,
            promotion_id: null,
            promotion_type: null,
        };
    }

    // Apply promotion on selling price
    const discount_amount =
        promotion.discount_type === "PERCENTAGE"
            ? +(sellingPrice * Number(promotion.discount_value) / 100).toFixed(2)
            : Math.min(Number(promotion.discount_value), sellingPrice);

    const final_price = +(sellingPrice - discount_amount).toFixed(2);

    const discount_percent =
        +(((sellingPrice - final_price) / sellingPrice) * 100).toFixed(2);

    return {
        original_price: mrp,
        final_price,
        discount_amount,
        discount_percent,
        promotion_id: promotion.promotion_id,
        promotion_type: promotion.promotion_type,
    };
}