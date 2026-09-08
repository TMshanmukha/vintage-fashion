import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { getThumbnail } from "../../utils/cloudinary";

export default function CategoryFormModal({
    open,
    onClose,
    onSave,
    initialData = null,
    saving = false
}) {

    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        name: "",
        description: ""
    });

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");

    useEffect(() => {

        if (!open) return;

        if (initialData) {

            setForm({
                name: initialData.name || "",
                description: initialData.description || ""
            });

            setPreview(initialData.image_url || "");
            setImage(null);

        } else {

            resetForm();

        }

    }, [open, initialData]);

    const resetForm = () => {

        setForm({
            name: "",
            description: ""
        });

        setImage(null);
        setPreview("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

    };

    const handleClose = () => {

        if (saving) return;

        resetForm();
        onClose();

    };

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

        if (!file.type.startsWith("image/")) {

            toast.error("Please select a valid image.");

            return;

        }

        if (file.size > 2 * 1024 * 1024) {

            toast.error("Image size should be less than 2 MB.");

            return;

        }

        setImage(file);
        setPreview(URL.createObjectURL(file));

    };

    const removeImage = () => {

        setImage(null);

        if (initialData) {

            setPreview(initialData.image_url || "");

        } else {

            setPreview("");

        }

        if (fileInputRef.current) {

            fileInputRef.current.value = "";

        }

    };

    const handleSubmit = (e) => {

        e.preventDefault();

        if (!form.name.trim()) {

            toast.error("Category name is required.");

            return;

        }

        if (form.name.trim().length < 3) {

            toast.error("Category name must contain at least 3 characters.");

            return;

        }

        const formData = new FormData();

        formData.append("name", form.name.trim());

        formData.append("description", form.description.trim());

        if (image) {

            formData.append("image", image);

        }

        onSave(formData);

    };

    if (!open) return null;
    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">

        <div className="w-full max-w-lg max-h-[90vh] rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden">

            {/* Header */}

            <div className="border-b border-gray-200 px-5 py-4 sm:px-6 sm:py-5 flex items-start justify-between">

                <div>

                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">

                        {initialData
                            ? "Edit Category"
                            : "Add Category"}

                    </h2>

                    <p className="mt-0.5 text-xs sm:text-sm text-gray-500">

                        {initialData
                            ? "Update your category details."
                            : "Create a new category for your products."}

                    </p>

                </div>

                <button
                    type="button"
                    disabled={saving}
                    onClick={handleClose}
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed"
                >
                    ✕
                </button>

            </div>

            {/* Form */}

            <form
                onSubmit={handleSubmit}
                id="category-form"
                className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-6 space-y-4 sm:space-y-6"
            >

                {/* Category Name */}

                <div>

                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">

                        Category Name *

                    </label>

                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        disabled={saving}
                        placeholder="Example: Men's Fashion"
                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 sm:py-3 text-sm outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
                    />

                    <p className="mt-1.5 text-xs text-gray-400">

                        This name will be visible to customers.

                    </p>

                </div>

                {/* Description */}

                <div>

                    <div className="mb-1.5 flex items-center justify-between">

                        <label className="text-sm font-semibold text-gray-700">

                            Description

                        </label>

                        <span className="text-xs text-gray-400">

                            {form.description.length}/300

                        </span>

                    </div>

                    <textarea
                        rows={3}
                        maxLength={300}
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        disabled={saving}
                        placeholder="Write a short description..."
                        className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 sm:py-3 text-sm outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
                    />

                </div>

                {/* Image Upload */}

                <div>

                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">

                        Category Image

                    </label>

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer rounded-2xl border-2 border-dashed border-gray-300 p-5 sm:p-6 text-center transition hover:border-pink-500 hover:bg-pink-50"
                    >

                        <div className="text-4xl sm:text-5xl">

                            🖼️

                        </div>

                        <p className="mt-3 text-sm font-semibold text-gray-700">

                            Click to upload an image

                        </p>

                        <p className="mt-1 text-xs text-gray-400">

                            PNG, JPG, JPEG or WEBP (Max 2 MB)

                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImage}
                            hidden
                        />

                    </div>

                </div>

                {/* Preview */}

                {preview && (

                    <div>

                        <div className="mb-2 flex items-center justify-between">

                            <h3 className="text-sm font-semibold text-gray-700">

                                Image Preview

                            </h3>

                            <button
                                type="button"
                                disabled={saving}
                                onClick={removeImage}
                                className="text-xs sm:text-sm font-medium text-red-500 transition hover:text-red-600"
                            >
                                Remove Image
                            </button>

                        </div>

                        <div className="overflow-hidden rounded-2xl border border-gray-200">

                            <img
                                src={
                                    preview?.startsWith("blob:")
                                        ? preview
                                        : getThumbnail(preview)
                                }
                                alt="Preview"
                                className="h-48 sm:h-56 w-full object-cover"
                            />

                        </div>

                    </div>

                )}

                {/* Footer */}

                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-gray-200 bg-white pt-4">

                    <button
                        type="button"
                        disabled={saving}
                        onClick={handleClose}
                        className="w-full sm:w-auto rounded-xl border border-gray-300 px-5 py-2.5 sm:py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-pink-500 px-6 py-2.5 sm:py-3 text-sm font-semibold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                        {saving && (

                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                        )}

                        {saving
                            ? (initialData ? "Updating..." : "Creating...")
                            : (initialData ? "Update Category" : "Create Category")}

                    </button>

                </div>

            </form>

        </div>

    </div>
);
}