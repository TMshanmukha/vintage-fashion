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
    let actualOriginalPrice = originalPrice;
    let actualPromo = promotion;

    // Handle 2-arg signature: applyPromotion(price, promotion)
    if (promotion === undefined && typeof originalPrice === "object") {
        actualPromo = originalPrice;
        actualOriginalPrice = price;
    } else if (actualOriginalPrice === undefined || actualOriginalPrice === null) {
        actualOriginalPrice = price;
    }

    const numPrice = Number(price);
    const sellingPrice = isNaN(numPrice) ? 0 : numPrice;
    const numMrp = Number(actualOriginalPrice);
    const mrp = isNaN(numMrp) || numMrp < sellingPrice ? sellingPrice : numMrp;

    if (!actualPromo) {
        const discount_amount = mrp > sellingPrice ? +(mrp - sellingPrice).toFixed(2) : 0;
        const discount_percent = (mrp > sellingPrice && mrp > 0)
            ? Math.round(((mrp - sellingPrice) / mrp) * 100)
            : 0;

        return {
            original_price: mrp,
            final_price: sellingPrice,
            discount_percent,
            discount_amount,
            promotion_id: null,
            promotion_type: null,
        };
    }

    const discountValue = Number(actualPromo.discount_value || 0);
    const safeDiscountValue = isNaN(discountValue) ? 0 : discountValue;

    // Apply promotion on selling price
    const promoDiscountAmount =
        actualPromo.discount_type === "PERCENTAGE"
            ? +(sellingPrice * safeDiscountValue / 100).toFixed(2)
            : Math.min(safeDiscountValue, sellingPrice);

    const safePromoDiscount = isNaN(promoDiscountAmount) ? 0 : Math.max(0, promoDiscountAmount);
    const final_price = +(sellingPrice - safePromoDiscount).toFixed(2);
    const safeFinalPrice = isNaN(final_price) ? sellingPrice : Math.max(0, final_price);

    // If mrp is higher than selling price, strike-through is mrp; otherwise sellingPrice
    const effectiveOriginalPrice = mrp > sellingPrice ? mrp : (safePromoDiscount > 0 ? sellingPrice : mrp);
    const totalDiscountAmount = effectiveOriginalPrice > safeFinalPrice
        ? +(effectiveOriginalPrice - safeFinalPrice).toFixed(2)
        : 0;
    const discount_percent = (effectiveOriginalPrice > safeFinalPrice && effectiveOriginalPrice > 0)
        ? Math.round(((effectiveOriginalPrice - safeFinalPrice) / effectiveOriginalPrice) * 100)
        : 0;

    return {
        original_price: effectiveOriginalPrice,
        final_price: safeFinalPrice,
        discount_amount: totalDiscountAmount,
        discount_percent: isNaN(discount_percent) ? 0 : discount_percent,
        promotion_id: actualPromo.promotion_id || null,
        promotion_type: actualPromo.promotion_type || null,
    };
}