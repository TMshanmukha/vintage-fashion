// Backend product shapes vary slightly by endpoint (raw /api/products rows
// vs featured-products join rows), so funnel both through here to match
// what ProductCard actually expects: { id, name, slug, image, price, originalPrice?, discountPercent?, badge? }
export function normalizeProduct(raw, { badge } = {}) {
  const image =
    raw.image_url ||
    raw.image ||
    (Array.isArray(raw.images) ? raw.images[0] : null) ||
    (Array.isArray(raw.product_images) ? raw.product_images[0]?.image_url : null) ||
    "";

  const rawPrice = Number(raw.final_price ?? raw.price) || 0;
  const rawOriginalPrice = raw.original_price != null ? Number(raw.original_price) : rawPrice;
  const calculatedDiscount = (rawOriginalPrice > rawPrice && rawOriginalPrice > 0)
    ? Math.round(((rawOriginalPrice - rawPrice) / rawOriginalPrice) * 100)
    : 0;
  const discountPercent = Number(raw.discount_percent || raw.discountPercent) || calculatedDiscount;

  return {
    id: raw.product_id ?? raw.id,
    slug: raw.slug,
    name: raw.product_name ?? raw.name,
    image,
    images: image ? [image] : [],
    price: rawPrice,
    originalPrice: rawOriginalPrice > rawPrice ? rawOriginalPrice : undefined,
    discountPercent,
    badge: badge ?? raw.badge,
  };
}