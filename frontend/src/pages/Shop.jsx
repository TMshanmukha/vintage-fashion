import { useState } from "react";
import { useSiteData } from "../hooks/useSiteData";
import ProductCard from "../components/ui/ProductCard";

const categories = ["All", "T-Shirts", "Jeans", "Jackets", "Accessories", "Shoes"];
const sortOptions = ["Default", "Price: Low to High", "Price: High to Low", "Newest"];

export default function Shop() {
  const { products } = useSiteData();
  const [activeCategory, setActiveCategory] = useState("All");
  const [sort, setSort] = useState("Default");
  const [priceRange, setPriceRange] = useState(200);

  const filtered = [...products]
    .filter((p) => priceRange >= p.price)
    .sort((a, b) => {
      if (sort === "Price: Low to High") return a.price - b.price;
      if (sort === "Price: High to Low") return b.price - a.price;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-8">
        <span className="hover:text-pink-500 cursor-pointer">Home</span>
        <span className="mx-2">/</span>
        <span className="text-gray-700 font-medium">Shop</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar */}
        <aside className="lg:w-56 flex-shrink-0">
          {/* Categories */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => setActiveCategory(cat)}
                    className={`text-sm w-full text-left transition-colors ${
                      activeCategory === cat ? "text-pink-500 font-semibold" : "text-gray-500 hover:text-pink-500"
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Filter */}
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4">Filter by Price</h3>
            <input
              type="range"
              min={0}
              max={200}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
            <p className="text-xs text-gray-500 mt-2">
              Price: <span className="font-semibold text-gray-800">${priceRange}</span>
            </p>
          </div>

          {/* Tags */}
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

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <p className="text-sm text-gray-400">Showing {filtered.length} results</p>
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-500">Sort by:</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-xs border border-gray-200 px-3 py-1.5 outline-none focus:border-pink-500 bg-white"
              >
                {sortOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-12 gap-2">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={`w-8 h-8 text-sm border transition-colors ${
                  n === 1
                    ? "bg-gray-900 text-white border-gray-900"
                    : "border-gray-200 text-gray-500 hover:border-pink-500 hover:text-pink-500"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
