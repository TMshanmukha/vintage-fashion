import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import BrandFormModal from "../components/BrandFormModal";
import ConfirmDialog from "../components/ConfirmDialog";

import api from "../../api/brandApi";
import { invalidateCache, cachedAxiosGet } from "../../utils/apiCache";

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const LIMIT = 10;

  const fetchBrands = async () => {
    try {
      setLoading(true);

      const res = await cachedAxiosGet(api, "/brands", {
        page: currentPage,
        limit: LIMIT,
        search: search || undefined,
      });

      setBrands(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages ?? 1);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load brands.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [currentPage]);

  const openAddModal = () => {
    setEditingBrand(null);
    setModalOpen(true);
  };

  const openEditModal = async (slug) => {
    try {
      setLoading(true);
      const res = await cachedAxiosGet(api, `/brands/${slug}`);
      setEditingBrand(res.data.data);
      setModalOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load brand.");
    } finally {
      setLoading(false);
    }
  };

  const buildFormData = (data) => {
    const fd = new FormData();
    fd.append("name", data.name);
    fd.append("description", data.description || "");
    if (data.logoFile) fd.append("logo", data.logoFile);
    if ("is_active" in data) fd.append("is_active", data.is_active ? "true" : "false");
    return fd;
  };

  const handleSave = async (formData) => {
    try {
      setSaving(true);
      const fd = buildFormData(formData);

      if (editingBrand) {
        await api.put(`/brands/${editingBrand.brand_id}`, fd);
        toast.success("Brand updated successfully.");
      } else {
        await api.post("/brands", fd);
        toast.success("Brand created successfully.");
      }

      invalidateCache("brands");
      setModalOpen(false);
      fetchBrands();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save brand.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/brands/${deleteTarget.brand_id}`);
      invalidateCache("brands");
      toast.success("Brand deleted successfully.");
      setDeleteTarget(null);
      fetchBrands();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete brand.");
    }
  };

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <AdminTopbar title="Brands" subtitle="Manage the brands sold on your store." />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
              placeholder="Search brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
            />
          </div>

          <button
            onClick={openAddModal}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-pink-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-600 shadow-sm"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Brand
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4">Brand</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 rounded-full border-4 border-pink-200 border-t-pink-500 animate-spin"></div>
                      <p className="text-sm text-gray-500">Loading brands...</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                filteredBrands.map((brand) => (
                  <tr
                    key={brand.brand_id}
                    className="transition hover:bg-gray-50 cursor-pointer"
                    onClick={() => openEditModal(brand.slug)}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        {brand.logo_url ? (
                          <img
                            src={brand.logo_url}
                            alt={brand.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&auto=format&fit=crop&q=80";
                            }}
                            className="h-14 w-14 rounded-xl border border-gray-100 object-cover shadow-sm bg-gray-50 flex-shrink-0"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-xl border border-gray-100 bg-gradient-to-br from-pink-500 to-rose-600 text-white font-bold flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                            {(brand.name || "B").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-800">{brand.name}</h3>
                          <p className="text-xs text-gray-400">/{brand.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 max-w-xs">
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {brand.description || "No description"}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      {Number(brand.is_active) ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(brand.slug);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(brand);
                          }}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && filteredBrands.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16">
                    <div className="flex flex-col items-center">
                      <div className="mb-4 text-6xl">🏷️</div>
                      <h3 className="text-lg font-semibold text-gray-700">No Brands Found</h3>
                      <p className="mt-2 text-sm text-gray-400">
                        Try changing your search or create your first brand.
                      </p>
                      <button
                        onClick={openAddModal}
                        className="mt-6 rounded-xl bg-pink-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-600"
                      >
                        + Add Brand
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
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
                  currentPage === i + 1 ? "bg-pink-500 text-white" : "border hover:bg-pink-50"
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

      <BrandFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingBrand}
        saving={saving}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Brand?"
        message={`"${deleteTarget?.name}" will be deactivated.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}