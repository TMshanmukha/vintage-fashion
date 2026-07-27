// Backend product shapes vary slightly by endpoint (raw /api/products rows
// vs featured-products join rows), so funnel both through here to match
// what ProductCard actually expects: { id, name, image, price, originalPrice?, badge? }
export function normalizeProduct(raw, { badge } = {}) {
  const image =
    raw.image_url ||
    raw.image ||
    (Array.isArray(raw.images) ? raw.images[0] : null) ||
    (Array.isArray(raw.product_images) ? raw.product_images[0]?.image_url : null) ||
    "";

  return {
    id: raw.product_id ?? raw.id,
    name: raw.product_name ?? raw.name,
    image,
    price: Number(raw.price) || 0,
    originalPrice: raw.original_price ? Number(raw.original_price) : undefined,
    badge: badge ?? raw.badge,
  };
}