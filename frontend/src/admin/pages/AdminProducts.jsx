import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import ProductFormModal from "../components/ProductFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import toast from "react-hot-toast";
import api from "../../api/productApi"; // adjust path if your shared axios instance lives elsewhere

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/products", {
        params: { search: search || undefined, page, limit: 10 },
      });

      setProducts(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  // Refetch when page changes; debounce search so we're not firing a request per keystroke
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      fetchProducts();
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openAddModal = () => { setEditingProduct(null); setModalOpen(true); };
  const openEditModal = (product) => { setEditingProduct(product); setModalOpen(true); };

  const handleSave = async (data) => {
    try {
      setSaving(true);

      if (editingProduct) {
        await api.put(`/api/products/${editingProduct.id}`, data);
        toast.success(`${data.name} was updated.`);
      } else {
        await api.post("/api/products", data);
        toast.success(`${data.name} was added to the catalog.`);
      }

      setModalOpen(false);
      await fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/api/products/${deleteTarget.id}`);
      toast.success(`${deleteTarget.name} was removed.`);
      setDeleteTarget(null);
      await fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete product.");
    }
  };

    // add this state
  const [categories, setCategories] = useState([]);

  // add this effect, once on mount
  useEffect(() => {
    api.get("/api/categories")
      .then((res) => setCategories(res.data.data || []))
      .catch((err) => console.error("Failed to load categories for dropdown", err));
  }, []);

  return (
    <AdminLayout>
      <AdminTopbar title="Products" subtitle="Add, edit, or remove items from your catalog." />

      <div className="p-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="relative w-72">
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors bg-white"
            />
          </div>
          <button
            onClick={openAddModal}
            className="bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-lg hover:bg-pink-500 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold uppercase tracking-widest text-gray-500">
                <th className="text-left px-6 py-4">Product</th>
                <th className="text-left px-6 py-4">Price</th>
                <th className="text-left px-6 py-4">Badge</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">Loading products...</td>
                </tr>
              )}

              {!loading && products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">SKU: FL-{p.id.toString().padStart(4, "0")}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-800">${p.price.toFixed(2)}</span>
                    {p.originalPrice && p.originalPrice !== p.price && (
                      <span className="text-xs text-gray-400 line-through ml-2">${p.originalPrice.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {p.badge ? (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.badge === "New" ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-500"}`}>
                        {p.badge}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditModal(p)} className="text-gray-400 hover:text-gray-900 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button onClick={() => setDeleteTarget(p)} className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-5">
            <p className="text-xs text-gray-400">
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} products
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-gray-900 transition-colors"
              >
                Prev
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-gray-900 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      
      // pass it to the modal
      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingProduct}
        categories={categories}
        saving={saving}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this product?"
        message={`"${deleteTarget?.name}" will be permanently removed from your catalog.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}