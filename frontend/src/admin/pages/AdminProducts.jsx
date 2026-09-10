import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";

import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import ProductFormModal from "../components/ProductFormModal";
import ConfirmDialog from "../components/ConfirmDialog";

import api from "../../api/productApi";
import { invalidateCache, cachedAxiosGet } from "../../utils/apiCache";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [allProductsRaw, setAllProductsRaw] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [totalItems, setTotalItems] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const LIMIT = 12;

  // ===========================
  // Fetch Data
  // ===========================
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await cachedAxiosGet(api, "/products", {
        page: currentPage,
        limit: LIMIT,
      });

      const list = res.data.data || [];
      setProducts(list);

      setTotalItems(
        res.data.pagination?.totalItems ??
        res.data.data?.totalItems ??
        list.length ??
        0
      );

      setTotalPages(res.data.pagination?.totalPages ?? 1);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllForCounts = async () => {
    try {
      const res = await cachedAxiosGet(api, "/products", { limit: 300 });
      const raw = res.data.data || [];
      setAllProductsRaw(Array.isArray(raw) ? raw : []);
    } catch (err) {
      // Ignore count fetch errors
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await api.get("/brands");
      setBrands(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchAllForCounts();
  }, []);

  // Category counts
  const categoryCounts = useMemo(() => {
    const list = allProductsRaw.length ? allProductsRaw : products;
    const counts = { all: list.length };
    categories.forEach((c) => {
      counts[c.category_id] = list.filter(
        (p) => Number(p.category_id) === Number(c.category_id) || p.category_name?.toLowerCase() === c.name?.toLowerCase()
      ).length;
    });
    return counts;
  }, [categories, allProductsRaw, products]);

  // Inventory stats
  const inventoryStats = useMemo(() => {
    const list = allProductsRaw.length ? allProductsRaw : products;
    const totalStock = list.reduce((sum, p) => sum + (Number(p.stock_quantity) || 0), 0);
    const lowStock = list.filter((p) => Number(p.stock_quantity) > 0 && Number(p.stock_quantity) <= 5).length;
    const outOfStock = list.filter((p) => Number(p.stock_quantity) === 0).length;
    return { totalStock, lowStock, outOfStock };
  }, [allProductsRaw, products]);

  // Search and category filtered
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        product.name?.toLowerCase().includes(q) ||
        product.brand_name?.toLowerCase().includes(q) ||
        product.category_name?.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === "all" ||
        Number(product.category_id) === Number(selectedCategory) ||
        product.category_name?.toLowerCase() === selectedCategory?.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  // ===========================
  // Modal
  // ===========================
  const openAddModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = async (slug) => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${slug}`);
      setEditingProduct(res.data.data);
      setModalOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load product.");
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // Save
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
      fetchProducts();
      fetchAllForCounts();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  // ===========================
  // Delete
  // ===========================
  const confirmDelete = async () => {
    try {
      await api.delete(`/products/${deleteTarget.product_id}`);
      invalidateCache("products");
      invalidateCache("marketing");
      toast.success("Product deleted successfully.");
      setDeleteTarget(null);
      fetchProducts();
      fetchAllForCounts();
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
            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Products</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalItems || products.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">Across all brands & styles</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Stock Available</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{inventoryStats.totalStock.toLocaleString("en-IN")}</p>
              <p className="text-xs text-gray-400 mt-0.5">Units ready to dispatch</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-sm bg-amber-50/20">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Low Stock (≤5)</span>
              <p className="text-2xl font-bold text-amber-700 mt-1">{inventoryStats.lowStock}</p>
              <p className="text-xs text-amber-600 mt-0.5">Requires reorder</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-red-200/80 shadow-sm bg-red-50/20">
              <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">Out of Stock</span>
              <p className="text-2xl font-bold text-red-700 mt-1">{inventoryStats.outOfStock}</p>
              <p className="text-xs text-red-600 mt-0.5">0 units remaining</p>
            </div>
          </div>

          {/* Category Filter Pills (with Total Count in Each Category) */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Filter by Category</span>
              <span className="text-xs text-gray-400">{categories.length} categories available</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedCategory === "all"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>All Catalog</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${selectedCategory === "all" ? "bg-white/20 text-white" : "bg-white text-gray-700"}`}>
                  {categoryCounts.all || products.length}
                </span>
              </button>

              {categories.map((c) => {
                const isSelected = selectedCategory === c.category_id || selectedCategory === c.name;
                const count = categoryCounts[c.category_id] ?? 0;
                return (
                  <button
                    key={c.category_id}
                    type="button"
                    onClick={() => setSelectedCategory(c.category_id)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                      isSelected
                        ? "bg-gray-900 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${isSelected ? "bg-white/20 text-white" : "bg-white text-gray-700 font-medium"}`}>
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
                  placeholder="Search products, brand, SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-xs outline-none transition focus:border-gray-900 focus:bg-white"
                />
              </div>

              <button
                onClick={openAddModal}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-gray-800 shadow-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Product
              </button>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200/80 bg-white shadow-sm">
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
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 rounded-full border-3 border-gray-300 border-t-gray-900 animate-spin" />
                        <p className="text-xs text-gray-500 font-medium">Loading catalog products...</p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && filteredProducts.map((product) => {
                  const discountPct = product.original_price && Number(product.original_price) > Number(product.price)
                    ? Math.round(((Number(product.original_price) - Number(product.price)) / Number(product.original_price)) * 100)
                    : 0;

                  return (
                    <tr
                      key={product.product_id}
                      className="transition hover:bg-gray-50/60 cursor-pointer"
                      onClick={() => openEditModal(product.slug)}
                    >
                      {/* Product */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={product.image_url || "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&auto=format&fit=crop&q=80"}
                            alt={product.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&auto=format&fit=crop&q=80";
                            }}
                            className="h-12 w-12 rounded-xl border border-gray-200 object-cover flex-shrink-0 bg-gray-50 shadow-xs"
                          />
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 truncate max-w-xs text-xs">{product.name}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-gray-500 font-medium">{product.brand_name || "Vintage Collection"}</span>
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
                        {Number(product.stock_quantity) > 10 ? (
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
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(product.slug);
                            }}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            title="Edit Product"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(product);
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Product"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
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
                          No products match your active search or category filters.
                        </p>
                        <button
                          onClick={openAddModal}
                          className="mt-4 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-800 transition-colors"
                        >
                          + Add Product
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
            <p>
              Page <span className="font-semibold text-gray-900">{currentPage}</span> of{" "}
              <span className="font-semibold text-gray-900">{totalPages}</span> ({totalItems} total products)
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40 transition-colors font-semibold"
              >
                Previous
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40 transition-colors font-semibold"
              >
                Next
              </button>
            </div>
          </div>
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
