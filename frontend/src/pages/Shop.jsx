import { useEffect, useMemo, useState } from "react";
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

// These match against each product's real admin-set `badge` field —
// not category names. "Sale" is the one exception: it's derived from
// actual discount data rather than a typed badge, since a discount is
// always true regardless of what badge text an admin chose.
const TAGS = ["New", "Sale", "Summer", "Winter", "Casual", "Formal"];

export default function Shop() {
  const [searchParams] = useSearchParams();
  const initialCategoryId = searchParams.get("category");

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState(
    initialCategoryId ? Number(initialCategoryId) : "All"
  );
  const [sort, setSort] = useState(sortOptions[0].label);
  const [priceRange, setPriceRange] = useState(PRICE_MAX);
  const [activeTag, setActiveTag] = useState(null);

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
        console.log(res.data[0]);
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

  const mappedProducts = useMemo(() => {
      return products.map(product => ({
          id: product.product_id,
          slug: product.slug,
          name: product.name,

          price: Number(product.final_price ?? product.price),

          originalPrice: Number(
              product.original_price ?? product.price
          ),

          discountPercent: Number(
              product.discount_percent ?? 0
          ),

          badge: product.badge,

          image: product.image_url,

          images: product.image_url
              ? [product.image_url]
              : [],

          rating: product.average_rating || 0,
      }));
  }, [products]);

  // Client-side filter over the current page's results. "Sale" checks real
  // discount data; every other tag matches against the product's own badge
  // field, exactly as set by the admin at creation time.
  const visibleProducts = useMemo(() => {

    if (!activeTag)
        return mappedProducts;

    return mappedProducts.filter(
        p =>
            (p.badge || "")
                .toLowerCase()
                .trim() ===
            activeTag.toLowerCase().trim()
    );

}, [mappedProducts, activeTag]);

  function handleTagClick(tag) {
    setActiveTag((prev) => (prev === tag ? null : tag));
  }

  const tags = useMemo(() => {

      const badgeTags = [
          ...new Set(
              products
                  .map(p => p.badge)
                  .filter(Boolean)
          )
      ];

      // if (
      //     products.some(
      //         p => Number(p.discount_percent) > 0
      //     )
      // ) {
      //     badgeTags.unshift("Sale");
      // }

      return badgeTags;

  }, [products]);

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
                  onClick={() => {
                    setActiveCategory("All");
                    setActiveTag(null);
                  }}
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
                    onClick={() => {
                      setActiveCategory(cat.category_id);
                      setActiveTag(null);
                    }}
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
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`text-xs border px-3 py-1 transition-colors ${
                    activeTag === tag
                      ? "border-pink-500 text-pink-500 bg-pink-50"
                      : "border-gray-200 text-gray-500 hover:border-pink-500 hover:text-pink-500"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <p className="text-sm text-gray-400">
              Showing {activeTag ? visibleProducts.length : pagination.totalProducts} results
            </p>
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-500">Sort by:</label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setActiveTag(null);
                }}
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
          ) : visibleProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleProducts.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-16 text-center">
              {activeTag ? `No products tagged "${activeTag}" on this page.` : "No products found."}
            </p>
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