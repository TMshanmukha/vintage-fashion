import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import ProductFormModal from "../components/ProductFormModal";
import ConfirmDialog from "../components/ConfirmDialog";

import api from "../../api/productApi";
import { invalidateCache, cachedAxiosGet } from "../../utils/apiCache";

export default function AdminProducts() {

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [totalItems, setTotalItems] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const LIMIT = 10;

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

            setProducts(res.data.data || []);

            setTotalItems(
                res.data.pagination?.totalItems ??
                res.data.data.totalItems ??
                0
            );

            setTotalPages(
                res.data.pagination?.totalPages ?? 1
            );

        }

        catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load products."
            );

        }

        finally {

            setLoading(false);

        }

    };

    const fetchCategories = async () => {

        try {

            const res = await api.get("/categories");

            setCategories(res.data.data || []);

        }

        catch (error) {

            console.error(error);

        }

    };

    const fetchBrands = async () => {

        try {

            const res = await api.get("/brands");

            setBrands(res.data.data || []);

        }

        catch (error) {

            console.error(error);

        }

    };

    useEffect(() => {
        fetchProducts();
    }, [currentPage]);

    useEffect(() => {
        fetchCategories();
        fetchBrands();
    }, []);
    // ===========================
    // Search
    // ===========================

    const filteredProducts = products.filter((product) =>

        product.name
            .toLowerCase()
            .includes(search.toLowerCase())

    );

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

        }

        catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Failed to load product."
            );

        }

        finally {

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

        //fd.append("stock_quantity", data.stock_quantity);
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
            // Don't set Content-Type manually — axios needs to generate
            // the multipart boundary itself for the browser's FormData.
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

            await api.delete(
                `/products/${deleteTarget.product_id}`
            );

            invalidateCache("products");
            invalidateCache("marketing");
            toast.success("Product deleted successfully.");

            setDeleteTarget(null);

            fetchProducts();

        }

        catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to delete product."
            );

        }

    };
    return (

    <AdminLayout>

        <AdminTopbar
            title="Products"
            subtitle="Manage all products available in your store."
        />

        <div className="p-4 sm:p-6 lg:p-8">

            {/* Toolbar */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                {/* Search */}

                <div className="relative w-full sm:max-w-xs md:max-w-sm">

                    <svg
                        className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
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
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
                    />

                </div>

                {/* Add Product */}

                <button
                    onClick={openAddModal}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-pink-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-600 shadow-sm"
                >

                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>

                    Add Product

                </button>

            </div>

            {/* Products Table */}

            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">

                <table className="w-full min-w-[700px]">

                    <thead>

                          <tr className="border-b bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-500">

                              <th className="px-6 py-4">
                                  Product
                              </th>

                              <th className="px-6 py-4">
                                  Category
                              </th>

                              <th className="px-6 py-4">
                                  Price
                              </th>

                              <th className="px-6 py-4">
                                  Stock
                              </th>

                              <th className="px-6 py-4 text-right">
                                  Actions
                              </th>

                          </tr>

                      </thead>

                      <tbody className="divide-y divide-gray-100">
                                      {/* Loading */}

              {loading && (

                  <tr>

                      <td
                          colSpan={5}
                          className="px-6 py-16 text-center"
                      >

                          <div className="flex flex-col items-center gap-3">

                              <div className="h-8 w-8 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin"></div>

                              <p className="text-sm text-gray-500">

                                  Loading products...

                              </p>

                          </div>

                      </td>

                  </tr>

              )}

              {/* Products */}

              {!loading && filteredProducts.map((product) => (

                  <tr
                      key={product.product_id}
                      className="transition hover:bg-gray-50 cursor-pointer"
                      onClick={() => openEditModal(product.slug)}
                  >

                      {/* Product */}

                      <td className="px-6 py-5">

                          <div className="flex items-center gap-4">

                             <img
                                src={product.image_url || "/no-image.png"}
                                alt={product.name}
                                className="h-16 w-16 rounded-xl border object-cover"
                            />

                              <div>

                                  <h3 className="font-semibold text-gray-800">

                                      {product.name}

                                  </h3>

                                  <p className="mt-1 text-sm text-gray-400">

                                      {product.brand_name || "No Brand"}

                                  </p>

                              </div>

                          </div>

                      </td>

                      {/* Category */}

                      <td className="px-6 py-5">

                          <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-600">

                              {product.category_name || "Uncategorized"}

                          </span>

                      </td>

                      {/* Price */}

                      <td className="px-6 py-5">

                          <div className="flex flex-col">

                              <span className="font-semibold text-gray-800">
                                  ₹{Number(product.price).toLocaleString("en-IN")}

                              </span>

                              {product.original_price && (

                                  <span className="text-sm text-gray-400 line-through">

                                      ₹{Number(product.original_price).toLocaleString("en-IN")}

                                  </span>

                              )}

                          </div>

                      </td>

                      {/* Stock */}

                      <td className="px-6 py-5">

                          {product.stock_quantity > 10 ? (

                              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">

                                  {product.stock_quantity} In Stock

                              </span>

                          ) : product.stock_quantity > 0 ? (

                              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">

                                  {product.stock_quantity} Low Stock

                              </span>

                          ) : (

                              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">

                                  Out of Stock

                              </span>

                          )}

                      </td>

                      {/* Actions */}

                      <td className="px-6 py-5">

                          <div className="flex justify-end gap-2">

                              <button
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      openEditModal(product.slug);
                                  }}
                              >
                                  ✏️
                              </button>

                              <button
                                  onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteTarget(product);
                                    }}
                                    className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                              >

                                  🗑️

                              </button>

                          </div>

                      </td>

                  </tr>

              ))}

              {/* Empty State */}

              {!loading && filteredProducts.length === 0 && (

                  <tr>

                      <td
                          colSpan={5}
                          className="px-6 py-16"
                      >

                          <div className="flex flex-col items-center">

                              <div className="mb-4 text-6xl">

                                  📦

                              </div>

                              <h3 className="text-lg font-semibold text-gray-700">

                                  No Products Found

                              </h3>

                              <p className="mt-2 text-sm text-gray-400">

                                  Try changing your search or create your first product.

                              </p>

                              <button
                                  onClick={openAddModal}
                                  className="mt-6 rounded-xl bg-pink-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-600"
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

    <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">

        <p className="text-sm text-gray-500 text-center sm:text-left">
            Showing page {currentPage} of {totalPages}
        </p>

        <div className="flex items-center gap-2 flex-wrap justify-center">

            <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className={`rounded-lg border px-4 py-2 text-sm ${
                    currentPage === 1
                        ? "cursor-not-allowed bg-gray-100 text-gray-400"
                        : "hover:bg-pink-50"
                }`}
            >
                Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => (

                <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`h-10 w-10 rounded-lg ${
                        currentPage === i + 1
                            ? "bg-pink-500 text-white"
                            : "border hover:bg-pink-50"
                    }`}
                >
                    {i + 1}
                </button>

            ))}

            <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className={`rounded-lg border px-4 py-2 text-sm ${
                    currentPage === totalPages
                        ? "cursor-not-allowed bg-gray-100 text-gray-400"
                        : "hover:bg-pink-50"
                }`}
            >
                Next
            </button>

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
          message={`"${deleteTarget?.name}" will be permanently deleted.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
      />

    </AdminLayout>

    );

}
