import { useEffect, useState, useMemo, useCallback } from "react";
import toast from "react-hot-toast";

import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import BrandFormModal from "../components/BrandFormModal";
import ConfirmDialog from "../components/ConfirmDialog";

import api from "../../api/brandApi";
import { invalidateCache, cachedAxiosGet } from "../../utils/apiCache";

const LIMIT = 15;

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const fetchBrands = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const res = await cachedAxiosGet(api, "/brands", { limit: 200 });
      const raw = res.data?.data ?? res.data;
      const list = Array.isArray(raw) ? raw : [];
      setBrands(list);
    } catch (error) {
      console.error(error);
      if (!isSilent) {
        toast.error(error.response?.data?.message || "Failed to load brands.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleStatusFilterChange = (filter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const openAddModal = () => {
    setEditingBrand(null);
    setModalOpen(true);
  };

  const openEditModal = (brand) => {
    setEditingBrand(brand);
    setModalOpen(true);
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
      setEditingBrand(null);
      fetchBrands(true);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save brand.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/brands/${deleteTarget.brand_id}`);
      invalidateCache("brands");
      toast.success("Brand removed successfully.");
      setDeleteTarget(null);
      fetchBrands(true);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete brand.");
    } finally {
      setDeleting(false);
    }
  };

  const stats = useMemo(() => {
    const totalCount = brands.length;
    const activeCount = brands.filter((b) => Number(b.is_active) === 1 || b.is_active === true).length;
    const inactiveCount = brands.filter((b) => Number(b.is_active) === 0 || b.is_active === false).length;
    return { totalCount, activeCount, inactiveCount };
  }, [brands]);

  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        b.name?.toLowerCase().includes(q) ||
        b.slug?.toLowerCase().includes(q) ||
        b.description?.toLowerCase().includes(q);

      const isActive = Number(b.is_active) === 1 || b.is_active === true;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);

      return matchesSearch && matchesStatus;
    });
  }, [brands, search, statusFilter]);

  const totalItems = filteredBrands.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / LIMIT));
  const paginatedBrands = useMemo(() => {
    const start = (currentPage - 1) * LIMIT;
    return filteredBrands.slice(start, start + LIMIT);
  }, [filteredBrands, currentPage]);

  return (
    <AdminLayout>
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        <AdminTopbar
          title="Brand Partners"
          description="Manage designer labels, vintage brand collections, and brand logos"
        />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Stats KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-sm">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">Total Brands</span>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">{stats.totalCount}</p>
              <p className="text-xs text-gray-400 mt-1">Catalog brand partners</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200/80 shadow-sm bg-gradient-to-br from-white to-emerald-50/40">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">Active Brands</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">{stats.activeCount}</p>
              <p className="text-xs text-emerald-600 font-bold mt-1">Live on customer storefront</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-sm bg-gradient-to-br from-white to-amber-50/40">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800">Inactive Brands</span>
              <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-2">{stats.inactiveCount}</p>
              <p className="text-xs text-amber-600 font-bold mt-1">Hidden from catalog</p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <svg
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
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
                placeholder="Search brands by name, slug..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-gray-50/50"
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

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                {["all", "active", "inactive"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => handleStatusFilterChange(tab)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                      statusFilter === tab
                        ? "bg-white text-gray-900 shadow-xs"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <button
                onClick={openAddModal}
                className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-gray-800 shadow-xs whitespace-nowrap"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Brand
              </button>
            </div>
          </div>

          {/* Brands Table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200/80 bg-white shadow-sm relative">
            {refreshing && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-pink-500 animate-pulse z-10" />
            )}

            <table className="w-full min-w-[650px] text-left text-xs">
              <thead className="bg-gray-50/80 text-[11px] font-bold uppercase tracking-wider text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4">Brand</th>
                  <th className="px-5 py-4">Description</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading && brands.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 rounded-full border-3 border-gray-300 border-t-gray-900 animate-spin" />
                        <p className="text-xs text-gray-500 font-medium">Loading brands...</p>
                      </div>
                    </td>
                  </tr>
                )}

                {paginatedBrands.map((brand) => {
                  const isActive = Number(brand.is_active) === 1 || brand.is_active === true;

                  return (
                    <tr
                      key={brand.brand_id}
                      className="transition hover:bg-gray-50/60 cursor-pointer"
                      onClick={() => openEditModal(brand)}
                    >
                      {/* Brand Logo & Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          {brand.logo_url ? (
                            <img
                              src={brand.logo_url}
                              alt={brand.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&auto=format&fit=crop&q=80";
                              }}
                              className="h-12 w-12 rounded-xl border border-gray-200 object-cover shadow-xs bg-gray-50 flex-shrink-0"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-900 to-gray-700 text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                              {(brand.name || "B").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 text-xs">{brand.name}</h3>
                            <span className="text-[10px] text-gray-400 font-mono">/{brand.slug}</span>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-5 py-4 max-w-sm">
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {brand.description || "No description provided"}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-100 text-gray-600 border-gray-300"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openEditModal(brand)}
                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors border border-transparent hover:border-gray-200"
                            title="Edit Brand"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(brand)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200"
                            title="Delete Brand"
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

                {!loading && filteredBrands.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="text-4xl mb-2">🏷️</div>
                        <h3 className="text-sm font-semibold text-gray-800">No Brands Found</h3>
                        <p className="mt-1 text-xs text-gray-500">
                          Try changing your search or add a new brand partner.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-500 font-medium">
                Page <span className="font-bold text-gray-900">{currentPage}</span> of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="text-xs font-bold px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors shadow-xs"
                >
                  ← Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="text-xs font-bold px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors shadow-xs"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
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
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}