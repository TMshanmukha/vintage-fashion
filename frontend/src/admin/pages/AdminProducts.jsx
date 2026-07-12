import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import ProductFormModal from "../components/ProductFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useSiteData } from "../../hooks/useSiteData";

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct, addNotification } = useSiteData();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const openAddModal = () => { setEditingProduct(null); setModalOpen(true); };
  const openEditModal = (product) => { setEditingProduct(product); setModalOpen(true); };

  const handleSave = (data) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
      addNotification({ title: "Product updated", body: `${data.name} was updated`, type: "product" });
    } else {
      addProduct(data);
      addNotification({ title: "New product added", body: `${data.name} was added to the catalog`, type: "product" });
    }
    setModalOpen(false);
  };

  const confirmDelete = () => {
    deleteProduct(deleteTarget.id);
    addNotification({ title: "Product deleted", body: `${deleteTarget.name} was removed`, type: "product" });
    setDeleteTarget(null);
  };

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
              {filtered.map((p) => (
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingProduct}
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
