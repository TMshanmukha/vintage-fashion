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
  const rawOriginalPrice = raw.original_price != null ? Number(raw.original_price) : Number(raw.price || rawPrice);
  const discountPercent = Number(raw.discount_percent || raw.discountPercent) || 0;

  return {
    id: raw.product_id ?? raw.id,
    slug: raw.slug,
    name: raw.product_name ?? raw.name,
    image,
    images: image ? [image] : [],
    price: rawPrice,
    originalPrice: rawOriginalPrice > rawPrice ? rawOriginalPrice : (discountPercent > 0 ? rawOriginalPrice : undefined),
    discountPercent,
    badge: badge ?? raw.badge,
  };
}