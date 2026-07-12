import { useEffect, useState } from "react";

export default function CategoryFormModal({
    open,
    onClose,
    onSave,
    initialData = null,
    saving = false
}) {

    const [form, setForm] = useState({
        name: "",
        description: "",
        sort_order: 0,
        is_active: true
    });

    const [image, setImage] = useState(null);

    const [preview, setPreview] = useState("");

    useEffect(() => {

        if (initialData) {

            setForm({
                name: initialData.name || "",
                description: initialData.description || "",
                sort_order: initialData.sort_order ?? 0,
                is_active: Boolean(initialData.is_active)
            });

            setPreview(initialData.image_url || "");

            setImage(null);

        } else {

            setForm({
                name: "",
                description: "",
                sort_order: 0,
                is_active: true
            });

            setPreview("");

            setImage(null);

        }

    }, [initialData, open]);

    if (!open) return null;

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));

    };

    const handleImage = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        setImage(file);

        setPreview(URL.createObjectURL(file));

    };

    const handleSubmit = (e) => {

        e.preventDefault();

        const formData = new FormData();

        formData.append("name", form.name);

        formData.append("description", form.description);

        formData.append("sort_order", form.sort_order);

        formData.append("is_active", form.is_active);

        if (image) {

            formData.append("image", image);

        }

        onSave(formData);

    };

    return (

    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-5">

        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* Header */}

            <div className="px-8 py-6 border-b border-gray-200">

                <h2 className="text-2xl font-bold text-gray-900">

                    {initialData ? "Edit Category" : "Add New Category"}

                </h2>

                <p className="text-sm text-gray-500 mt-1">

                    Organize products by creating categories.

                </p>

            </div>

            <form
                onSubmit={handleSubmit}
                className="p-8 space-y-6"
            >

                {/* Category Name */}

                <div>

                    <label className="block text-sm font-semibold text-gray-700 mb-2">

                        Category Name *

                    </label>

                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        disabled={saving}
                        placeholder="Example: Men"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                    />

                </div>

                {/* Description */}

                <div>

                    <label className="block text-sm font-semibold text-gray-700 mb-2">

                        Description

                    </label>

                    <textarea
                        rows={4}
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Write a short description..."
                        disabled={saving}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none resize-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                    />

                </div>

                <div className="grid grid-cols-2 gap-6">

                    {/* Sort Order */}

                    <div>

                        <label className="block text-sm font-semibold text-gray-700 mb-2">

                            Sort Order

                        </label>

                        <input
                            type="number"
                            name="sort_order"
                            value={form.sort_order}
                            onChange={handleChange}
                            disabled={saving}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                        />

                    </div>

                    {/* Status */}

                    <div>

                        <label className="block text-sm font-semibold text-gray-700 mb-2">

                            Status

                        </label>

                        <label className="flex items-center gap-3 h-[52px] px-4 rounded-xl border border-gray-300 cursor-pointer">

                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        is_active: e.target.checked
                                    })
                                }
                            />

                            <span className="text-sm font-medium">

                                Active Category

                            </span>

                        </label>

                    </div>

                </div>

                {/* Image Upload */}

                <div>

                    <label className="block text-sm font-semibold text-gray-700 mb-2">

                        Category Image

                    </label>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImage}
                        disabled={saving}
                        className="w-full rounded-xl border border-gray-300 p-3"
                    />

                </div>

                {preview && (

                    <div>

                        <p className="text-sm font-semibold text-gray-700 mb-3">

                            Image Preview

                        </p>

                        <img
                            src={preview}
                            alt="Preview"
                            className="w-36 h-36 rounded-xl object-cover border shadow-sm"
                        />

                    </div>

                )}

                                {/* Footer */}

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold transition disabled:opacity-60 flex items-center gap-2"
                    >

                        {saving && (

                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                        )}

                        {saving
                            ? "Saving..."
                            : initialData
                            ? "Update Category"
                            : "Create Category"}

                    </button>

                </div>

            </form>

        </div>

    </div>

);
}