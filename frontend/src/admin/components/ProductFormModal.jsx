import { useEffect, useState } from "react";

const emptyForm = {
  category_id: "",
  brand_id: "",
  name: "",
  description: "",
  price: "",
  original_price: "",
  badge: "",
  variants: []
};

const emptyVariant = {
  size: "",
  color: "",
  color_hex: "",
  stock_quantity: "",
  price_modifier: "",
  is_default: false
};

export default function ProductFormModal({
  open,
  onClose,
  onSave,
  initialData = null,
  categories = [],
  brands = [],
  saving = false
}) {
  const [form, setForm] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]); // [{file, url}]
  const [imageError, setImageError] = useState("");

  const [showVariantForm, setShowVariantForm] = useState(false);
  const [variantForm, setVariantForm] = useState(emptyVariant);
  const [editingVariantIndex, setEditingVariantIndex] = useState(null);

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setForm({
        category_id: initialData.category_id || "",
        brand_id: initialData.brand_id || "",
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price ?? "",
        original_price: initialData.original_price ?? "",
        badge: initialData.badge || "",
        variants: (initialData.variants || []).map((v) => ({
          size: v.size || "",
          color: v.color || "",
          color_hex: v.color_hex || "",
          stock_quantity: v.stock_quantity ?? "",
          price_modifier: v.price_modifier ?? "",
          is_default: Boolean(v.is_default)
        }))
      });
      setExistingImages(initialData.images || []);
    } else {
      setForm(emptyForm);
      setExistingImages([]);
    }

    setNewImages([]);
    setImageError("");
  }, [initialData, open]);

  if (!open) return null;

  // ===== Images =====

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setNewImages((prev) => [
      ...prev,
      ...files.map((file) => ({ file, url: URL.createObjectURL(file) }))
    ]);
    setImageError("");
    e.target.value = "";
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const makeNewImagePrimary = (index) => {
    // First item in the array becomes the primary image on submit,
    // so reorder rather than tracking a separate flag.
    setNewImages((prev) => {
      const copy = [...prev];
      const [chosen] = copy.splice(index, 1);
      return [chosen, ...copy];
    });
  };

  const clearNewImages = () => setNewImages([]);

  const removeExistingImage = (index) => {
    setExistingImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length && !updated.some((img) => img.is_primary)) {
        updated[0] = { ...updated[0], is_primary: true };
      }
      return updated;
    });
  };

  const makeExistingImagePrimary = (index) => {
    setExistingImages((prev) =>
      prev.map((img, i) => ({ ...img, is_primary: i === index }))
    );
  };

  // ===== Variants =====

  const saveVariant = () => {
    console.log("variantForm", variantForm);
    if (!variantForm.stock_quantity) return;

    setForm((prev) => {
      if (editingVariantIndex !== null) {
        const updatedVariants = [...prev.variants];

        updatedVariants[editingVariantIndex] = variantForm;

        return {
          ...prev,
          variants: updatedVariants
        };
      }

      return {
        ...prev,
        variants: [...prev.variants, variantForm]
      };
    });

    setVariantForm(emptyVariant);
    setEditingVariantIndex(null);
    setShowVariantForm(false);
  };

  const removeVariant = (index) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  // ===== Submit =====

  const handleSubmit = (e) => {
    e.preventDefault();

    const hasImages = newImages.length > 0 || existingImages.length > 0;
    if (!hasImages) {
      setImageError("Add at least one product image.");
      return;
    }

    onSave({
      ...form,
      existingImages,
      newImages: newImages.map((i) => i.file)
    });
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100";
  const labelClass = "text-sm font-semibold text-gray-700";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5">
      <div className="w-full max-w-6xl h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b bg-white rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? "Edit Product" : "Add Product"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage your product details, gallery and variants.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-10 h-10 rounded-xl hover:bg-gray-100 transition text-gray-500"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <form
          id="product-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-8 py-8 space-y-10"
        >
          {/* GENERAL INFORMATION */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-6">
              General Information
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className={labelClass}>Product Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  disabled={saving}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              {/* SKU — only shown when editing, and never editable */}
              {initialData && (
                <div>
                  <label className={labelClass}>SKU</label>
                  <input
                    value={initialData.sku || ""}
                    disabled
                    className={`${inputClass} bg-gray-100 text-gray-500 cursor-not-allowed`}
                  />
                </div>
              )}

              <div>
                <label className={labelClass}>Category</label>
                <select
                  required
                  value={form.category_id}
                  disabled={saving}
                  onChange={(e) =>
                    setForm({ ...form, category_id: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Brand</label>
                <select
                  required
                  value={form.brand_id}
                  disabled={saving}
                  onChange={(e) =>
                    setForm({ ...form, brand_id: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand.brand_id} value={brand.brand_id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  rows={5}
                  value={form.description}
                  disabled={saving}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </div>

          {/* PRICING */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-6">Pricing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className={labelClass}>Price (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.price}
                  disabled={saving}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Original Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.original_price}
                  disabled={saving}
                  onChange={(e) =>
                    setForm({ ...form, original_price: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className={labelClass}>Badge</label>
                <select
                  value={form.badge}
                  disabled={saving}
                  onChange={(e) =>
                    setForm({ ...form, badge: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">None</option>
                  <option value="New">New</option>
                  <option value="Sale">Sale</option>
                  <option value="Hot">Hot</option>
                </select>
              </div>
            </div>
          </div>

        
          

          {/* PRODUCT IMAGES */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800">
                Product Images
              </h3>
              <div>
                <input
                  id="product-images"
                  type="file"
                  multiple
                  accept="image/*"
                  disabled={saving}
                  onChange={handleNewImages}
                  className="hidden"
                />
                <label
                  htmlFor="product-images"
                  className="cursor-pointer rounded-xl bg-pink-500 px-5 py-2 text-sm font-semibold text-white hover:bg-pink-600 transition"
                >
                  + Add Images
                </label>
              </div>
            </div>

            {imageError && (
              <p className="mb-4 text-sm font-medium text-red-500">
                {imageError}
              </p>
            )}

            {newImages.length > 0 ? (
              <>
                <div className="mb-3 flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                  <p className="text-sm text-amber-700">
                    New images will replace all existing images for this
                    product on save.
                  </p>
                  {existingImages.length > 0 && (
                    <button
                      type="button"
                      onClick={clearNewImages}
                      className="text-sm font-semibold text-amber-700 hover:underline shrink-0 ml-4"
                    >
                      Keep existing instead
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {newImages.map((image, index) => (
                    <div
                      key={image.url}
                      className="rounded-2xl border bg-white overflow-hidden shadow-sm"
                    >
                      <img
                        src={image.url}
                        alt=""
                        className="h-44 w-full object-cover"
                      />
                      <div className="p-3 space-y-2">
                        {index === 0 && (
                          <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Primary
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="w-full rounded-lg border border-red-200 py-2 text-sm text-red-500 hover:bg-red-50"
                        >
                          Remove
                        </button>
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => makeNewImagePrimary(index)}
                            className="w-full rounded-lg border border-green-300 py-2 text-sm text-green-600 hover:bg-green-50"
                          >
                            Make Primary
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : existingImages.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-300 py-12 text-center">
                <div className="text-5xl mb-3">🖼️</div>
                <p className="font-semibold text-gray-600">
                  No Images Added
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Upload product images.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {existingImages.map((image, index) => (
                  <div
                    key={image.image_id ?? index}
                    className="rounded-2xl border bg-white overflow-hidden shadow-sm"
                  >
                    <img
                      src={image.image_url}
                      alt=""
                      className="h-44 w-full object-cover"
                    />
                    <div className="p-3 space-y-2">
                      {image.is_primary && (
                        <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="w-full rounded-lg border border-red-200 py-2 text-sm text-red-500 hover:bg-red-50"
                      >
                        Remove
                      </button>
                      {!image.is_primary && (
                        <button
                          type="button"
                          onClick={() => makeExistingImagePrimary(index)}
                          className="w-full rounded-lg border border-green-300 py-2 text-sm text-green-600 hover:bg-green-50"
                        >
                          Make Primary
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PRODUCT VARIANTS */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">
                Product Variants
              </h3>
              <button
                type="button"
                onClick={() => {
                  setVariantForm(emptyVariant);
                  setEditingVariantIndex(null);
                  setShowVariantForm(true);
                }}
                className="rounded-xl bg-pink-500 px-5 py-2 text-sm font-semibold text-white hover:bg-pink-600 transition"
              >
                + Add Variant
              </button>
            </div>

            {form.variants.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-300 py-12 text-center">
                <div className="text-5xl mb-3">📦</div>
                <p className="font-semibold text-gray-600">
                  No Variants Added
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs uppercase text-gray-500">
                        Size
                      </th>
                      <th className="px-5 py-4 text-left text-xs uppercase text-gray-500">
                        Color
                      </th>
                      <th className="px-5 py-4 text-left text-xs uppercase text-gray-500">
                        Stock
                      </th>
                      <th className="px-5 py-4 text-left text-xs uppercase text-gray-500">
                        Price Modifier
                      </th>
                      <th className="px-5 py-4 text-left text-xs uppercase text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.variants.map((variant, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-5 py-4">{variant.size || "-"}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {variant.color_hex && (
                              <span
                                className="h-4 w-4 rounded-full border"
                                style={{ backgroundColor: variant.color_hex }}
                              />
                            )}
                            {variant.color || "-"}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {variant.stock_quantity}
                        </td>
                        <td className="px-5 py-4">
                          {Number(variant.price_modifier) >= 0 ? "+" : ""}
                          ₹{variant.price_modifier || 0}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <button
                              type="button"
                              onClick={() => {
                                setVariantForm(variant);
                                setEditingVariantIndex(index);
                                setShowVariantForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="text-red-500 hover:text-red-700 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {showVariantForm && (
              <div className="mt-6 rounded-2xl border p-6 bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  <input
                    placeholder="Size (e.g. M)"
                    value={variantForm.size}
                    onChange={(e) =>
                      setVariantForm({ ...variantForm, size: e.target.value })
                    }
                    className="rounded-xl border px-4 py-3"
                  />
                  <input
                    placeholder="Color name"
                    value={variantForm.color}
                    onChange={(e) =>
                      setVariantForm({
                        ...variantForm,
                        color: e.target.value
                      })
                    }
                    className="rounded-xl border px-4 py-3"
                  />
                  <input
                    type="color"
                    value={variantForm.color_hex || "#000000"}
                    onChange={(e) =>
                      setVariantForm({
                        ...variantForm,
                        color_hex: e.target.value
                      })
                    }
                    className="rounded-xl border h-[46px] px-2"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Stock"
                    value={variantForm.stock_quantity}
                    onChange={(e) =>
                      setVariantForm({
                        ...variantForm,
                        stock_quantity: e.target.value
                      })
                    }
                    className="rounded-xl border px-4 py-3"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price modifier"
                    value={variantForm.price_modifier}
                    onChange={(e) =>
                      setVariantForm({
                        ...variantForm,
                        price_modifier: e.target.value
                      })
                    }
                    className="rounded-xl border px-4 py-3"
                  />
                </div>

                <label className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={variantForm.is_default}
                    onChange={(e) =>
                      setVariantForm({
                        ...variantForm,
                        is_default: e.target.checked
                      })
                    }
                  />
                  Default variant
                </label>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVariantForm(false);
                      setVariantForm(emptyVariant);
                      setEditingVariantIndex(null);
                    }}
                    className="px-5 py-2 rounded-xl border"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveVariant}
                    className="px-6 py-2 rounded-xl bg-pink-500 text-white"
                  >
                    Save Variant
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* PRODUCT INFORMATION (edit only) */}
          {initialData && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-6">
                Product Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Product ID
                  </p>
                  <p className="mt-2 text-lg font-semibold text-gray-800">
                    #{initialData.product_id}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Rating
                  </p>
                  <p className="mt-2 text-lg font-semibold text-yellow-500">
                    ⭐ {initialData.average_rating || "0.00"}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Reviews
                  </p>
                  <p className="mt-2 text-lg font-semibold text-gray-800">
                    {initialData.review_count || 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Created At
                  </p>
                  <p className="mt-2 text-sm font-medium text-gray-700">
                    {initialData.created_at
                      ? new Date(initialData.created_at).toLocaleString()
                      : "-"}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Updated At
                  </p>
                  <p className="mt-2 text-sm font-medium text-gray-700">
                    {initialData.updated_at
                      ? new Date(initialData.updated_at).toLocaleString()
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* FOOTER */}
        <div className="border-t bg-white px-8 py-5 rounded-b-3xl">
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="min-w-[180px] rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={saving}
              className="min-w-[220px] rounded-xl bg-pink-500 px-6 py-3 font-semibold text-white hover:bg-pink-600 transition flex items-center justify-center gap-3"
            >
              {saving && (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {saving
                ? "Saving..."
                : initialData
                ? "Save Changes"
                : "Create Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}