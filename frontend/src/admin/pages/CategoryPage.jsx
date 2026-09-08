import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import CategoryFormModal from "../components/CategoryFormModel";
import ConfirmDialog from "../components/ConfirmDialog";
import toast from "react-hot-toast";
import api, {
    restoreCategory
} from "../../api/categoryApi";
import { getThumbnail } from "../../utils/cloudinary";

export default function AdminCategories() {

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadedImages, setLoadedImages] = useState({});
    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [deleteTarget, setDeleteTarget] = useState(null);

    const [saving, setSaving] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const LIMIT = 10;

    const handleRestore = async (categoryId) => {

        try {

            await restoreCategory(categoryId);

            toast.success(
                "Category restored successfully."
            );

            fetchCategories();

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Failed to restore category."
            );

        }

    };

    const fetchCategories = async () => {

        try {

            setLoading(true);

            const res = await api.get("/categories", {
                params: {
                    page: currentPage,
                    limit: LIMIT,
                },
            });

            console.log(res.data);

            setCategories(res.data.data || []);

            setTotalItems(
                res.data.pagination?.totalItems ?? 0
            );

            setTotalPages(
                res.data.pagination?.totalPages ?? 1
            );

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load categories."
            );

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchCategories();

    }, [currentPage]);

    const filteredCategories = categories.filter((category) =>
        category.name
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const openAddModal = () => {

        setEditingCategory(null);

        setModalOpen(true);

    };

    const openEditModal = (category) => {

        setEditingCategory(category);

        setModalOpen(true);

    };

    const handleSave = async (formData) => {

        try {

            setSaving(true);

            if (editingCategory) {

                await api.put(
                    `/categories/${editingCategory.category_id}`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );

                toast.success("Category updated successfully.");

            } else {

                await api.post(
                    "/categories",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );

                toast.success("Category created successfully.");

            }

            setModalOpen(false);

            setEditingCategory(null);

            fetchCategories();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Operation failed."
            );

        } finally {

            setSaving(false);

        }

    };

    const confirmDelete = async () => {

        try {

            await api.delete(
                `/categories/${deleteTarget.category_id}`
            );

            toast.success("Category deleted successfully.");

            setDeleteTarget(null);

            fetchCategories();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to delete category."
            );

        }

    };
    
    return (
        <AdminLayout>

            <AdminTopbar
                title="Categories"
                subtitle="Create and manage your product categories."
            />

            <div className="p-4 sm:p-6 lg:p-8">

                {/* Toolbar */}

                <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-6">

                    <div className="relative w-full sm:w-72">

                        <svg
                            className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
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
                            placeholder="Search category..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-pink-500"
                        />

                    </div>

                    <button
                        onClick={openAddModal}
                        className="bg-gray-900 hover:bg-pink-500 transition text-white px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-widest flex w-full sm:w-auto items-center justify-center gap-2 shadow-sm"
                    >

                        <svg
                            className="w-4 h-4"
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

                        Add Category

                    </button>

                </div>

                {/* Table */}

                <div className="min-h-[400px] bg-white rounded-xl border border-gray-100 overflow-x-auto shadow-sm">

                    <table className="w-full min-w-[650px]">

                        <thead>

                            <tr className="bg-gray-50 text-xs font-bold uppercase tracking-widest text-gray-500">

                                <th className="text-left px-6 py-4">
                                    Category
                                </th>

                                <th className="text-left px-6 py-4">
                                    Slug
                                </th>

                                <th className="text-left px-6 py-4">
                                    Status
                                </th>

                                <th className="text-right px-6 py-4">
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody className="divide-y divide-gray-100">

                            {loading &&
                                Array.from({ length: 8 }).map((_, index) => (

                                    <tr key={index} className="animate-pulse">

                                        <td className="px-6 py-4">

                                            <div className="flex items-center gap-3">

                                                <div className="h-12 w-12 rounded-lg bg-gray-200"></div>

                                                <div>

                                                    <div className="mb-2 h-4 w-32 rounded bg-gray-200"></div>

                                                    <div className="h-3 w-20 rounded bg-gray-100"></div>

                                                </div>

                                            </div>

                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="h-4 w-24 rounded bg-gray-200"></div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="h-6 w-20 rounded-full bg-gray-200"></div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="ml-auto h-8 w-16 rounded bg-gray-200"></div>
                                        </td>

                                    </tr>

                                ))}

                            {!loading &&
                                filteredCategories.map((category) => (

                                    <tr
                                        key={category.category_id}
                                        className={`transition hover:bg-gray-50 ${
                                            !category.is_active
                                                ? "bg-gray-50 opacity-70"
                                                : ""
                                        }`}
                                    >

                                        <td className="px-6 py-4">

                                            <div className="flex items-center gap-3">

                                                <div className="relative h-12 w-12">

                                                    {!loadedImages[category.category_id] && (
                                                        <div className="absolute inset-0 animate-pulse rounded-lg bg-gray-200" />
                                                    )}

                                                    <img
                                                        src={getThumbnail(category.image_url)}
                                                        alt={category.name}
                                                        onLoad={() =>
                                                            setLoadedImages((prev) => ({
                                                                ...prev,
                                                                [category.category_id]: true
                                                            }))
                                                        }
                                                        className={`h-12 w-12 rounded-lg object-cover transition-opacity duration-300 ${
                                                            loadedImages[category.category_id]
                                                                ? "opacity-100"
                                                                : "opacity-0"
                                                        }`}
                                                    />

                                                </div>

                                                <div>

                                                    <p className="font-medium text-gray-800">
                                                        {category.name}
                                                    </p>

                                                    <p className="text-xs text-gray-400">
                                                        #{category.category_id}
                                                    </p>

                                                </div>

                                            </div>

                                        </td>

                                        <td className="px-6 py-4 text-sm">
                                            {category.slug}
                                        </td>

                                        <td className="px-6 py-4">

                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                                    category.is_active
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {category.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>

                                        </td>

                                        <td className="px-6 py-4">

                                            <div className="flex justify-end gap-2">

                                                {category.is_active ? (

                                                    <>

                                                        <button
                                                            onClick={() => openEditModal(category)}
                                                            className="rounded-lg p-2 hover:bg-gray-100"
                                                        >
                                                            ✏️
                                                        </button>

                                                        <button
                                                            onClick={() => setDeleteTarget(category)}
                                                            className="rounded-lg p-2 hover:bg-red-50"
                                                        >
                                                            🗑️
                                                        </button>

                                                    </>

                                                ) : (

                                                    <button
                                                        onClick={() =>
                                                            handleRestore(category.category_id)
                                                        }
                                                        className="rounded-lg p-2 hover:bg-green-50"
                                                        title="Restore Category"
                                                    >
                                                        ♻️
                                                    </button>

                                                )}

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            {!loading &&
                                filteredCategories.length === 0 && (

                                    <tr>

                                        <td
                                            colSpan={4}
                                            className="px-6 py-12 text-center text-gray-400"
                                        >
                                            No Categories Found
                                        </td>

                                    </tr>

                                )}

                        </tbody>

                    </table>

                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">

                    <p className="text-sm text-gray-500 text-center sm:text-left">
                        Page {currentPage} of {totalPages}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap justify-center">

                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            className={`rounded-lg border px-4 py-2 text-sm ${currentPage === 1
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
                                className={`h-10 w-10 rounded-lg ${currentPage === i + 1
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
                            className={`rounded-lg border px-4 py-2 text-sm ${currentPage === totalPages
                                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                                    : "hover:bg-pink-50"
                                }`}
                        >
                            Next
                        </button>

                    </div>

                </div>

            </div>

            <CategoryFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                initialData={editingCategory}
                saving={saving}
            />

            {/* Delete API later */}

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete Category?"
                message={`"${deleteTarget?.name}" will be permanently deleted.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />

        </AdminLayout>
    );
}