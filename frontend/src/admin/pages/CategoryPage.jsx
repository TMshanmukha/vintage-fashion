import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import CategoryFormModal from "../components/CategoryFormModel";
import ConfirmDialog from "../components/ConfirmDialog";
import toast from "react-hot-toast";
import api from "../../api/categoryApi";

export default function AdminCategories() {

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [deleteTarget, setDeleteTarget] = useState(null);

    const [saving, setSaving] = useState(false);

    const fetchCategories = async () => {

        try {

            setLoading(true);

            const res = await api.get("/categories");

            setCategories(res.data.data || []);

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

    }, []);

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

            setModalOpen(false);

            fetchCategories();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Failed to create category."
            );

        } finally {

            setSaving(false);

        }

    };

    // const confirmDelete = async () => {
    //     try {
    //         await api.delete(`/categories/${deleteTarget.category_id}`);
    //
    //         toast.success("Category deleted.");
    //
    //         setDeleteTarget(null);
    //
    //         fetchCategories();
    //
    //     } catch (error) {
    //
    //         toast.error(
    //             error.response?.data?.message ||
    //             "Failed to delete category."
    //         );
    //
    //     }
    // };
    return (
    <AdminLayout>

        <AdminTopbar
            title="Categories"
            subtitle="Create and manage your product categories."
        />

        <div className="p-8">

            {/* Toolbar */}

            <div className="flex items-center justify-between mb-6">

                <div className="relative w-72">

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
                    className="bg-gray-900 hover:bg-pink-500 transition text-white px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2"
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

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">

                <table className="w-full">

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

                        {loading && (

                            <tr>

                                <td
                                    colSpan={4}
                                    className="px-6 py-12 text-center text-gray-400 text-sm"
                                >
                                    Loading Categories...
                                </td>

                            </tr>

                        )}

                        {!loading &&
                            filteredCategories.map((category) => (

                                <tr
                                    key={category.category_id}
                                    className="hover:bg-gray-50 transition"
                                >

                                    <td className="px-6 py-4">

                                        <div className="flex items-center gap-3">

                                            <img
                                                src={
                                                    category.image_url ||
                                                    "/no-image.png"
                                                }
                                                alt={category.name}
                                                className="w-12 h-12 rounded-lg object-cover border"
                                            />

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
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                category.is_active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-600"
                                            }`}
                                        >
                                            {category.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>

                                    </td>

                                    <td className="px-6 py-4">

                                        <div className="flex justify-end gap-2">

                                            <button
                                                onClick={() =>
                                                    openEditModal(category)
                                                }
                                                className="p-2 rounded-lg hover:bg-gray-100"
                                            >
                                                ✏️
                                            </button>

                                            <button
                                                onClick={() =>
                                                    setDeleteTarget(category)
                                                }
                                                className="p-2 rounded-lg hover:bg-red-50"
                                            >
                                                🗑️
                                            </button>

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

        </div>

        <CategoryFormModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
            initialData={editingCategory}
            saving={saving}
        />

        {/* Delete API later */}

        {/*

        <ConfirmDialog
            open={!!deleteTarget}
            title="Delete Category?"
            message={`"${deleteTarget?.name}" will be permanently deleted.`}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteTarget(null)}
        />

        */}

    </AdminLayout>
);
}