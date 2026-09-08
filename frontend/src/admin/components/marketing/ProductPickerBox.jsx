import { useState, useMemo } from "react";

export default function ProductPickerBox({
  allProducts = [],
  selectedIds = [],
  onToggleProduct,
  categories = [],
  title = "Select Products",
  onClose,
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Selected ID set for fast lookups
  const selectedIdSet = useMemo(() => {
    return new Set(
      selectedIds.map((item) => (typeof item === "object" ? item?.product_id : item))
    );
  }, [selectedIds]);

  // Filter products by search text and category
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allProducts.filter((p) => {
      // Category filter
      if (selectedCategory !== "ALL") {
        const catMatch =
          String(p.category_id) === String(selectedCategory) ||
          p.category_name?.toLowerCase() === selectedCategory.toLowerCase();
        if (!catMatch) return false;
      }

      // Search filter
      if (q) {
        const nameMatch = p.name?.toLowerCase().includes(q);
        const skuMatch = String(p.product_id).includes(q) || p.sku?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        if (!nameMatch && !skuMatch && !descMatch) return false;
      }

      return true;
    });
  }, [allProducts, search, selectedCategory]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 my-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            🛍️ {title}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Search 1000+ items and filter by category with live preview
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-pink-50 text-pink-600 border border-pink-200 px-3 py-1 rounded-full">
            {selectedIdSet.size} Selected
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <svg
            className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search products by name, SKU or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all bg-white"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all bg-white font-medium text-gray-700"
          >
            <option value="ALL">All Categories ({allProducts.length})</option>
            {categories.map((c) => (
              <option key={c.category_id || c.name} value={c.category_id || c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center text-xs text-gray-400 px-1">
        <span>Showing {filteredProducts.length} matching products</span>
        {selectedIdSet.size > 0 && (
          <span className="text-pink-600 font-medium">
            {selectedIdSet.size} active in this section
          </span>
        )}
      </div>

      {/* Product List with Image & Details */}
      <div className="max-h-80 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-100 bg-gray-50/50 pr-1">
        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-sm">No products found matching your search.</p>
            <p className="text-xs mt-1 text-gray-400">Try adjusting your keywords or category filter.</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isSelected = selectedIdSet.has(product.product_id);
            const imageSrc = product.image_url || product.image || product.images?.[0];

            return (
              <div
                key={product.product_id}
                className={`flex items-center justify-between p-3 transition-colors ${
                  isSelected ? "bg-pink-50/40" : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Thumbnail Image */}
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100 flex-shrink-0">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xs text-gray-400 font-bold">👗</span>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs font-bold text-pink-600">
                        ₹{Number(product.price || 0).toLocaleString("en-IN")}
                      </span>
                      {product.category_name && (
                        <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                          {product.category_name}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          (product.stock_quantity ?? 0) <= 0
                            ? "bg-red-50 text-red-600"
                            : (product.stock_quantity ?? 0) <= 5
                            ? "bg-amber-50 text-amber-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {(product.stock_quantity ?? 0) <= 0
                          ? "Out of stock"
                          : `${product.stock_quantity} in stock`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Add / Remove Action Button */}
                <div className="ml-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleProduct(product)}
                    className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm ${
                      isSelected
                        ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                        : "bg-pink-500 hover:bg-pink-600 text-white hover:scale-105"
                    }`}
                  >
                    {isSelected ? "Remove" : "+ Add"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
