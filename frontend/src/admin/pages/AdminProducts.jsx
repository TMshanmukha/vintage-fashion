import { useEffect, useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";

import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import ProductFormModal from "../components/ProductFormModal";
import ConfirmDialog from "../components/ConfirmDialog";

import api from "../../api/productApi";
import { invalidateCache, cachedAxiosGet } from "../../utils/apiCache";

const LIMIT = 15;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all"); // "all" | "in_stock" | "low_stock" | "out_of_stock"
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ===========================
  // Fetch Data (Full Catalog for 0ms Instant Filtering)
  // ===========================
  const fetchProducts = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);

      const res = await cachedAxiosGet(api, "/products", { limit: 1000 });
      const raw = res.data?.data ?? res.data?.products ?? res.data;
      const list = Array.isArray(raw) ? raw : Array.isArray(raw?.products) ? raw.products : [];
      setProducts(list);
    } catch (error) {
      console.error("Products load error:", error);
      if (!isBackground) {
        toast.error(error.response?.data?.message || "Failed to load products.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/categories");
      const list = res.data?.data ?? res.data;
      setCategories(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Categories load error:", error);
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const res = await api.get("/brands");
      const list = res.data?.data ?? res.data;
      setBrands(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Brands load error:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, [fetchProducts, fetchCategories, fetchBrands]);

  // Reset pagination when filter criteria changes
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleStockFilterChange = (filter) => {
    setStockFilter(filter);
    setCurrentPage(1);
  };

  // ===========================
  // Category Counts (Instant)
  // ===========================
  const categoryCounts = useMemo(() => {
    const counts = { all: products.length };
    categories.forEach((c) => {
      counts[c.category_id] = products.filter(
        (p) =>
          Number(p.category_id) === Number(c.category_id) ||
          p.category_name?.toLowerCase() === c.name?.toLowerCase()
      ).length;
    });
    return counts;
  }, [categories, products]);

  // ===========================
  // Inventory Stats (Instant)
  // ===========================
  const inventoryStats = useMemo(() => {
    const totalStock = products.reduce((sum, p) => sum + (Number(p.stock_quantity) || 0), 0);
    const lowStock = products.filter((p) => Number(p.stock_quantity) > 0 && Number(p.stock_quantity) <= 5).length;
    const outOfStock = products.filter((p) => Number(p.stock_quantity) === 0).length;
    const inStock = products.filter((p) => Number(p.stock_quantity) > 5).length;
    return { totalStock, lowStock, outOfStock, inStock };
  }, [products]);

  // ===========================
  // Instant 0ms Filter Engine
  // ===========================
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Search filter
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        product.name?.toLowerCase().includes(q) ||
        product.brand_name?.toLowerCase().includes(q) ||
        product.category_name?.toLowerCase().includes(q) ||
        String(product.product_id).includes(q) ||
        (product.sku && String(product.sku).toLowerCase().includes(q));

      // 2. Category filter
      const matchesCategory =
        selectedCategory === "all" ||
        Number(product.category_id) === Number(selectedCategory) ||
        product.category_name?.toLowerCase() === String(selectedCategory).toLowerCase();

      // 3. Stock filter
      const qty = Number(product.stock_quantity) || 0;
      let matchesStock = true;
      if (stockFilter === "low_stock") matchesStock = qty > 0 && qty <= 5;
      else if (stockFilter === "out_of_stock") matchesStock = qty === 0;
      else if (stockFilter === "in_stock") matchesStock = qty > 5;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, selectedCategory, stockFilter]);

  // Client-side pagination
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / LIMIT));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * LIMIT;
    return filteredProducts.slice(start, start + LIMIT);
  }, [filteredProducts, currentPage]);

  // ===========================
  // Modal Actions (0ms Instant Open)
  // ===========================
  const openAddModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = async (product) => {
    // Open immediately with local data for 0ms transition!
    setEditingProduct(product);
    setModalOpen(true);

    // Silently fetch full details (variants/extra photos) in background if slug exists
    if (product?.slug) {
      try {
        const res = await api.get(`/products/${product.slug}`);
        const detailed = res.data?.data || res.data;
        if (detailed) {
          setEditingProduct(detailed);
        }
      } catch (err) {
        // Keep existing product if detailed fetch fails
      }
    }
  };

  // ===========================
  // Save Product
  // ===========================
  const buildFormData = (data) => {
    const fd = new FormData();

    fd.append("category_id", data.category_id);
    fd.append("brand_id", data.brand_id);
    fd.append("name", data.name);
    fd.append("description", data.description || "");
    fd.append("price", data.price);

    if (data.original_price !== "" && data.original_price != null) {
      fd.append("original_price", data.original_price);
    }
    if (data.badge) {
      fd.append("badge", data.badge);
    }

    fd.append("variants", JSON.stringify(data.variants || []));

    if (data.newImages && data.newImages.length > 0) {
      data.newImages.forEach((file) => fd.append("images", file));
    } else if (data.existingImages && data.existingImages.length > 0) {
      fd.append("images", JSON.stringify(data.existingImages));
    }

    return fd;
  };

  const handleSave = async (formData) => {
    try {
      setSaving(true);
      const fd = buildFormData(formData);

      if (editingProduct) {
        await api.put(`/products/${editingProduct.product_id}`, fd);
        toast.success("Product updated successfully.");
      } else {
        await api.post("/products", fd);
        toast.success("Product created successfully.");
      }

      invalidateCache("products");
      invalidateCache("marketing");
      setModalOpen(false);
      setEditingProduct(null);
      fetchProducts(true); // silent background update
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  // ===========================
  // Delete Product
  // ===========================
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/products/${deleteTarget.product_id}`);
      invalidateCache("products");
      invalidateCache("marketing");
      toast.success("Product deleted successfully.");
      setDeleteTarget(null);
      fetchProducts(true);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete product.");
    }
  };

  return (
    <AdminLayout>
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        <AdminTopbar
          title="Products Catalog"
          description="Manage catalog inventory, variants, categories, and live pricing"
        />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Inventory Overview Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => handleStockFilterChange("all")}
              className={`p-4 rounded-2xl border text-left transition-all duration-150 ${
                stockFilter === "all"
                  ? "bg-white border-gray-900 shadow-md ring-2 ring-gray-900/10"
                  : "bg-white border-gray-200/80 shadow-xs hover:border-gray-300"
              }`}
            >
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Products</span>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">{products.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Across all brands & styles</p>
            </button>

            <button
              type="button"
              onClick={() => handleStockFilterChange("in_stock")}
              className={`p-4 rounded-2xl border text-left transition-all duration-150 ${
                stockFilter === "in_stock"
                  ? "bg-emerald-50/50 border-emerald-600 shadow-md ring-2 ring-emerald-600/10"
                  : "bg-white border-gray-200/80 shadow-xs hover:border-emerald-300"
              }`}
            >
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Units In Stock</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
                {inventoryStats.totalStock.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">{inventoryStats.inStock} products well-stocked</p>
            </button>

            <button
              type="button"
              onClick={() => handleStockFilterChange("low_stock")}
              className={`p-4 rounded-2xl border text-left transition-all duration-150 ${
                stockFilter === "low_stock"
                  ? "bg-amber-50 border-amber-600 shadow-md ring-2 ring-amber-600/10"
                  : "bg-white border-amber-200/80 shadow-xs hover:border-amber-400 bg-amber-50/20"
              }`}
            >
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Low Stock (≤5)</span>
              <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">{inventoryStats.lowStock}</p>
              <p className="text-xs text-amber-600 mt-0.5">Requires replenishment</p>
            </button>

            <button
              type="button"
              onClick={() => handleStockFilterChange("out_of_stock")}
              className={`p-4 rounded-2xl border text-left transition-all duration-150 ${
                stockFilter === "out_of_stock"
                  ? "bg-red-50 border-red-600 shadow-md ring-2 ring-red-600/10"
                  : "bg-white border-red-200/80 shadow-xs hover:border-red-400 bg-red-50/20"
              }`}
            >
              <span className="text-xs font-bold text-red-800 uppercase tracking-wider">Out of Stock</span>
              <p className="text-2xl sm:text-3xl font-black text-red-700 mt-1">{inventoryStats.outOfStock}</p>
              <p className="text-xs text-red-600 mt-0.5">0 units remaining</p>
            </button>
          </div>

          {/* Category Filter Pills (Instantaneous 0ms switching) */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Filter by Category</span>
                {selectedCategory !== "all" && (
                  <button
                    onClick={() => handleCategoryChange("all")}
                    className="text-[11px] font-bold text-pink-600 hover:text-pink-700 underline"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <span className="text-xs text-gray-500 font-medium">
                Showing <strong className="text-gray-900 font-bold">{totalItems}</strong> of {products.length} products
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => handleCategoryChange("all")}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-150 flex items-center gap-2 ${
                  selectedCategory === "all"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>All Catalog</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                    selectedCategory === "all" ? "bg-white/20 text-white" : "bg-white text-gray-800 shadow-xs"
                  }`}
                >
                  {categoryCounts.all || products.length}
                </span>
              </button>

              {categories.map((c) => {
                const isSelected =
                  Number(selectedCategory) === Number(c.category_id) ||
                  selectedCategory === c.name;
                const count = categoryCounts[c.category_id] ?? 0;
                return (
                  <button
                    key={c.category_id}
                    type="button"
                    onClick={() => handleCategoryChange(c.category_id)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-150 flex items-center gap-2 ${
                      isSelected
                        ? "bg-gray-900 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span>{c.name}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                        isSelected ? "bg-white/20 text-white" : "bg-white text-gray-800 shadow-xs"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search & Add Product Action Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2 border-t border-gray-100">
              <div className="relative w-full sm:max-w-md">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.3-4.3m0 0A7.5 7.5 0 105.4 5.4a7.5 7.5 0 0011.3 11.3z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search products by title, brand, SKU or ID..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-xs outline-none transition focus:border-gray-900 focus:bg-white"
                />
                {search && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {stockFilter !== "all" && (
                  <button
                    onClick={() => handleStockFilterChange("all")}
                    className="px-3 py-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl"
                  >
                    Reset Stock Filter ✕
                  </button>
                )}

                <button
                  onClick={() => fetchProducts(true)}
                  disabled={refreshing}
                  className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 transition-colors shadow-xs"
                  title="Refresh Products"
                >
                  <svg
                    className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>

                <button
                  onClick={openAddModal}
                  className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-gray-800 shadow-sm"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Product
                </button>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200/80 bg-white shadow-sm relative">
            {refreshing && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-pink-500 animate-pulse z-10" />
            )}

            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="bg-gray-50/80 text-[11px] font-bold uppercase tracking-wider text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4">Product Details</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Price & Discount</th>
                  <th className="px-5 py-4">Stock Available</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading && products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 rounded-full border-3 border-gray-300 border-t-gray-900 animate-spin" />
                        <p className="text-xs text-gray-500 font-medium">Loading catalog products...</p>
                      </div>
                    </td>
                  </tr>
                )}

                {paginatedProducts.map((product) => {
                  const discountPct =
                    product.original_price && Number(product.original_price) > Number(product.price)
                      ? Math.round(
                          ((Number(product.original_price) - Number(product.price)) /
                            Number(product.original_price)) *
                            100
                        )
                      : 0;

                  return (
                    <tr
                      key={product.product_id}
                      className="transition hover:bg-gray-50/70 cursor-pointer"
                      onClick={() => openEditModal(product)}
                    >
                      {/* Product */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={
                              product.image_url ||
                              "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&auto=format&fit=crop&q=80"
                            }
                            alt={product.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&auto=format&fit=crop&q=80";
                            }}
                            className="h-12 w-12 rounded-xl border border-gray-200 object-cover flex-shrink-0 bg-gray-50 shadow-xs"
                          />
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 truncate max-w-xs text-xs">{product.name}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-gray-500 font-medium">
                                {product.brand_name || "Vintage Collection"}
                              </span>
                              <span className="text-[10px] text-gray-300">•</span>
                              <span className="text-[10px] text-gray-400 font-mono">ID: #{product.product_id}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        <span className="inline-block rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-800 border border-gray-200/80">
                          {product.category_name || "General"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-gray-900 text-sm">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                          </span>
                          {product.original_price && Number(product.original_price) > Number(product.price) && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{Number(product.original_price).toLocaleString("en-IN")}
                            </span>
                          )}
                          {discountPct > 0 && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                              {discountPct}% OFF
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-4">
                        {Number(product.stock_quantity) > 5 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {product.stock_quantity} In Stock
                          </span>
                        ) : Number(product.stock_quantity) > 0 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {product.stock_quantity} Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Out of Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => openEditModal(product)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            title="Edit Product"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(product)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Product"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!loading && filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="text-3xl">🛍️</div>
                        <h3 className="text-sm font-semibold text-gray-800">No Products Found</h3>
                        <p className="text-xs text-gray-500 max-w-sm">
                          {search
                            ? `No products match your search "${search}".`
                            : "No products match your active category or stock filter."}
                        </p>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => {
                              setSelectedCategory("all");
                              setStockFilter("all");
                              setSearch("");
                            }}
                            className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            Reset All Filters
                          </button>
                          <button
                            onClick={openAddModal}
                            className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-800 transition-colors"
                          >
                            + Add Product
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
              <p>
                Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * LIMIT + 1}</span> -{" "}
                <span className="font-semibold text-gray-900">
                  {Math.min(currentPage * LIMIT, totalItems)}
                </span>{" "}
                of <span className="font-semibold text-gray-900">{totalItems}</span> products (Page{" "}
                <span className="font-semibold text-gray-900">{currentPage}</span> of{" "}
                <span className="font-semibold text-gray-900">{totalPages}</span>)
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40 transition-colors font-semibold shadow-xs"
                >
                  ← Previous
                </button>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40 transition-colors font-semibold shadow-xs"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingProduct}
        categories={categories}
        brands={brands}
        saving={saving}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Product?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will permanently deactivate the listing.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}
