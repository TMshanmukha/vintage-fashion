import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategoriesUser } from "../api/categoryApi";
import { getProducts } from "../api/productApi";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=800&fit=crop";

// Hardcoded seasonal promo art stays as-is — these are marketing banners,
// not real category images, so they don't come from the backend.
const SEASONAL_COLLECTIONS = [
  {
    label: "Summer Collection",
    year: "2026",
    image: "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=800&h=600&fit=crop",
    matchNames: ["summer"],
  },
  {
    label: "Winter Collection",
    year: "2026",
    image: "https://images.unsplash.com/photo-1551489186-cf8726f514f8?w=800&h=600&fit=crop",
    matchNames: ["winter"],
  },
];

export default function Collection() {
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({}); // { [category_id]: totalProducts }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await getCategoriesUser();
        const list = res.data || [];
        if (!mounted) return;
        setCategories(list);

        // One lightweight count-only request per category, in parallel.
        const counts = await Promise.all(
          list.map(async (cat) => {
            try {
              const productsRes = await getProducts({
                category: cat.category_id,
                limit: 1,
              });
              return [cat.category_id, productsRes.pagination?.totalProducts || 0];
            } catch {
              return [cat.category_id, 0];
            }
          })
        );

        if (mounted) {
          setCategoryCounts(Object.fromEntries(counts));
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Resolve each seasonal card against the real category list by name match.
  const resolvedSeasonal = SEASONAL_COLLECTIONS.map((seasonal) => {
    const match = categories.find((cat) =>
      seasonal.matchNames.some((name) =>
        (cat.name || "").toLowerCase().includes(name)
      )
    );
    const inStock = match && (categoryCounts[match.category_id] || 0) > 0;
    return { ...seasonal, match, inStock };
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gray-100 py-20 text-center">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=300&fit=crop" alt="" className="w-full h-full object-cover opacity-40" />
        </div>
        <div className="relative">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Collection</h1>
          <nav className="text-xs text-gray-500">
            <Link to="/" className="hover:text-pink-500">Home</Link>
            <span className="mx-2">/</span>
            <span>Collection</span>
          </nav>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Seasonal Collections */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Seasonal Collections</h2>
            <div className="w-10 h-0.5 bg-gray-900 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resolvedSeasonal.map((seasonal) => (
              <div
                key={seasonal.label}
                className="relative overflow-hidden group aspect-[4/3]"
              >
                <img
                  src={seasonal.image}
                  alt={seasonal.label}
                  className={`w-full h-full object-cover transition-transform duration-700 ${seasonal.inStock ? "group-hover:scale-105" : "grayscale opacity-70"
                    }`}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                <div className="absolute bottom-8 left-8">
                  <p className="text-white/80 text-xs uppercase tracking-widest mb-1">{seasonal.year}</p>
                  <h3 className="text-white text-3xl font-extrabold mb-4">{seasonal.label}</h3>
                  {seasonal.inStock ? (
                    <Link
                      to={`/shop?category=${seasonal.match.category_id}`}
                      className="inline-block bg-white text-gray-900 text-xs font-bold uppercase tracking-widest px-6 py-2.5 hover:bg-gray-900 hover:text-white transition-colors"
                    >
                      Shop Now
                    </Link>
                  ) : (
                    <span className="inline-block bg-white/70 text-gray-500 text-xs font-bold uppercase tracking-widest px-6 py-2.5 cursor-not-allowed">
                      Products Out of Stock
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shop by Category */}
        <div>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop by Category</h2>
            <div className="w-10 h-0.5 bg-gray-900 mx-auto" />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square mb-3 bg-gray-100" />
                  <div className="h-4 bg-gray-100 rounded w-2/3 mx-auto mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No categories available yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((cat) => {
                const count = categoryCounts[cat.category_id] || 0;
                const outOfStock = count === 0;

                return (
                  <div key={cat.category_id} className="group text-center">
                    {outOfStock ? (
                      <div className="cursor-not-allowed">
                        <div className="overflow-hidden aspect-square mb-3">
                          <img
                            src={cat.image_url || PLACEHOLDER_IMAGE}
                            alt={cat.name}
                            className="w-full h-full object-cover grayscale opacity-60"
                          />
                        </div>
                        <h3 className="text-sm font-bold text-gray-400">{cat.name}</h3>
                        <p className="text-xs text-gray-400">Out of stock</p>
                      </div>
                    ) : (
                      <Link to={`/shop?category=${cat.category_id}`}>
                        <div className="overflow-hidden aspect-square mb-3">
                          <img
                            src={cat.image_url || PLACEHOLDER_IMAGE}
                            alt={cat.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-pink-500 transition-colors">{cat.name}</h3>
                        <p className="text-xs text-gray-400">{count} product{count === 1 ? "" : "s"}</p>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}