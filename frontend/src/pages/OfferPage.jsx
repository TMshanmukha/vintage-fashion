import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../components/ui/ProductCard";
import { getCardById, getBannerById, getFlashSaleById } from "../api/marketingApi";

const FETCHERS = {
  card: getCardById,
  banner: getBannerById,
  "flash-sale": getFlashSaleById,
};

// Cards/banners use discount_percent + products[].product_name.
// Flash sales use discount_value + products[].name.
// Normalize both into one shape so the page below doesn't care which it got.
function normalize(type, raw) {
  if (!raw) return null;

  if (type === "flash-sale") {
    return {
      title: raw.title,
      subtitle: raw.description,
      discount: Number(raw.discount_value) || 0,
      products: (raw.products || []).map((p) => ({
        product_id: p.product_id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        image_url: p.image_url,
      })),
    };
  }

  return {
    title: raw.title,
    subtitle: raw.subtitle,
    discount: Number(raw.discount_percent) || 0,
    products: (raw.products || []).map((p) => ({
      product_id: p.product_id,
      name: p.product_name,
      slug: p.slug,
      price: p.price,
      image_url: p.image_url,
    })),
  };
}

export default function OfferPage() {
  const { type, id } = useParams();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetcher = FETCHERS[type];
    if (!fetcher) {
      setOffer(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    fetcher(id)
      .then((res) => mounted && setOffer(normalize(type, res.data?.data)))
      .catch(() => mounted && setOffer(null))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [type, id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center text-gray-400">
        Loading offer…
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center text-gray-400">
        Offer not found.
      </div>
    );
  }

  const { title, subtitle, discount, products } = offer;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <nav className="text-xs text-gray-400 mb-8">
        <span className="text-gray-700 font-medium">{title}</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-500 mt-2">{subtitle}</p>}
        {discount > 0 && (
          <span className="inline-block mt-4 bg-pink-100 text-pink-600 text-sm font-bold px-4 py-1.5 rounded-full">
            {discount}% OFF
          </span>
        )}
      </div>

      {products.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => {
            const rawPrice = Number(p.price);
            const finalPrice =
              discount > 0 ? +(rawPrice * (1 - discount / 100)).toFixed(2) : rawPrice;

            return (
              <ProductCard
                key={p.product_id}
                product={{
                  id: p.product_id,
                  slug: p.slug,
                  name: p.name,
                  price: finalPrice,
                  originalPrice: discount > 0 ? rawPrice : null,
                  image: p.image_url,
                  images: p.image_url ? [p.image_url] : [],
                }}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-400 py-16 text-center">
          No products in this offer yet.
        </p>
      )}
    </div>
  );
}