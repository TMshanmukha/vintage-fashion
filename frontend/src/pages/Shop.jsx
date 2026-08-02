import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ui/ProductCard";
import { getProducts } from "../api/productApi";
import { getCategoriesUser as getCategories } from "../api/categoryApi";

const PRICE_MAX = 10000;

const sortOptions = [
  { label: "Default", value: "newest" },
  { label: "Price: Low to High", value: "price_low_to_high" },
  { label: "Price: High to Low", value: "price_high_to_low" },
  { label: "Newest", value: "newest" },
];

export default function Shop() {
  const [searchParams] = useSearchParams();
  const promoCategoryId = searchParams.get("category");
  const promoDiscount = Number(searchParams.get("discount")) || 0;

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState(
    promoCategoryId ? Number(promoCategoryId) : "All"
  );
  const [sort, setSort] = useState(sortOptions[0].label);
  const [priceRange, setPriceRange] = useState(PRICE_MAX);

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalProducts: 0, totalPages: 1 });

  useEffect(() => {
    (async () => {
      try {
        const res = await getCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    })();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, sort, priceRange]);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const sortValue = sortOptions.find((o) => o.label === sort)?.value || "newest";

      try {
        const res = await getProducts({
          page,
          limit: 12,
          category: activeCategory === "All" ? undefined : activeCategory,
          maxPrice: priceRange === PRICE_MAX ? undefined : priceRange,
          sort: sortValue,
        });

        setProducts(res.data || []);
        setPagination({
          totalProducts: res.pagination?.totalProducts || 0,
          totalPages: res.pagination?.totalPages || 1,
        });
      } catch (err) {
        console.error("Failed to load products:", err);
        setProducts([]);
        setPagination({ totalProducts: 0, totalPages: 1 });
      }

      setLoading(false);
    })();
  }, [activeCategory, sort, priceRange, page]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <nav className="text-xs text-gray-400 mb-8">
        <span className="hover:text-pink-500 cursor-pointer">Home</span>
        <span className="mx-2">/</span>
        <span className="text-gray-700 font-medium">Shop</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-56 flex-shrink-0">
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveCategory("All")}
                  className={`text-sm w-full text-left transition-colors ${
                    activeCategory === "All" ? "text-pink-500 font-semibold" : "text-gray-500 hover:text-pink-500"
                  }`}
                >
                  All
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.category_id}>
                  <button
                    onClick={() => setActiveCategory(cat.category_id)}
                    className={`text-sm w-full text-left transition-colors ${
                      activeCategory === cat.category_id ? "text-pink-500 font-semibold" : "text-gray-500 hover:text-pink-500"
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4">Filter by Price</h3>
            <input
              type="range"
              min={0}
              max={PRICE_MAX}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
            <p className="text-xs text-gray-500 mt-2">
              Price: <span className="font-semibold text-gray-800">₹{priceRange}</span>
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {["New", "Sale", "Summer", "Winter", "Casual", "Formal"].map((tag) => (
                <button
                  key={tag}
                  className="text-xs border border-gray-200 text-gray-500 px-3 py-1 hover:border-pink-500 hover:text-pink-500 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <p className="text-sm text-gray-400">Showing {pagination.totalProducts} results</p>
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-500">Sort by:</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-xs border border-gray-200 px-3 py-1.5 outline-none focus:border-pink-500 bg-white"
              >
                {sortOptions.map((o) => (
                  <option key={o.label}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse h-72" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => {
                const rawPrice = Number(product.price);
                const applyPromo =
                  promoDiscount > 0 &&
                  promoCategoryId &&
                  activeCategory === Number(promoCategoryId);
                const finalPrice = applyPromo
                  ? +(rawPrice * (1 - promoDiscount / 100)).toFixed(2)
                  : rawPrice;

                return (
                  <ProductCard
                    key={product.product_id}
                    product={{
                      id: product.product_id,
                      slug: product.slug,
                      name: product.name,
                      price: finalPrice,
                      originalPrice: applyPromo
                        ? rawPrice
                        : product.original_price
                        ? Number(product.original_price)
                        : null,
                      image: product.image_url,
                      images: product.image_url ? [product.image_url] : [],
                      rating: product.average_rating || 0,
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-16 text-center">No products found.</p>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-12 gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 text-sm border transition-colors ${
                    n === page
                      ? "bg-gray-900 text-white border-gray-900"
                      : "border-gray-200 text-gray-500 hover:border-pink-500 hover:text-pink-500"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}