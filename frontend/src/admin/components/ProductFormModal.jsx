import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { compressImage } from "../../utils/compressImage";

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
  color_hex: "#000000",
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

  const variantFormRef = useRef(null);
  const sizeInputRef = useRef(null);

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
          variant_id: v.variant_id,
          sku_variant: v.sku_variant || "",
          size: v.size || "",
          color: v.color || "",
          color_hex: v.color_hex || "#000000",
          stock_quantity: v.stock_quantity != null ? v.stock_quantity : "",
          price_modifier: v.price_modifier != null ? v.price_modifier : "",
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
    setShowVariantForm(false);
    setVariantForm(emptyVariant);
    setEditingVariantIndex(null);
  }, [initialData, open]);

  if (!open) return null;

  // ===== Images =====

  const handleNewImages = async (e) => {
    const rawFiles = Array.from(e.target.files || []);
    if (!rawFiles.length) return;

    // Fast instant compression
    const compressedFiles = await Promise.all(
      rawFiles.map((file) => compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.82 }))
    );

    setNewImages((prev) => [
      ...prev,
      ...compressedFiles.map((file) => ({ file, url: URL.createObjectURL(file) }))
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

  const handleOpenAddVariant = () => {
    setVariantForm(emptyVariant);
    setEditingVariantIndex(null);
    setShowVariantForm(true);
    setTimeout(() => {
      variantFormRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      sizeInputRef.current?.focus();
    }, 60);
  };

  const handleOpenEditVariant = (variant, index) => {
    setVariantForm({
      ...variant,
      stock_quantity: variant.stock_quantity != null ? variant.stock_quantity : "",
      price_modifier: variant.price_modifier != null ? variant.price_modifier : ""
    });
    setEditingVariantIndex(index);
    setShowVariantForm(true);
    setTimeout(() => {
      variantFormRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      sizeInputRef.current?.focus();
    }, 60);
  };

  const saveVariant = () => {
    const size = (variantForm.size || "").trim();
    const color = (variantForm.color || "").trim();

    if (!size && !color) {
      toast.error("Please provide at least a Size or Color for the variant.");
      return;
    }

    const rawStock = variantForm.stock_quantity;
    const stockQty = rawStock !== "" && rawStock !== null && rawStock !== undefined
      ? parseInt(rawStock, 10)
      : 0;

    if (isNaN(stockQty) || stockQty < 0) {
      toast.error("Please enter a valid stock quantity (0 or greater).");
      return;
    }

    const rawPriceMod = variantForm.price_modifier;
    const priceMod = rawPriceMod !== "" && rawPriceMod !== null && rawPriceMod !== undefined
      ? parseFloat(rawPriceMod)
      : 0;

    const normalizedVariant = {
      ...variantForm,
      size,
      color,
      color_hex: variantForm.color_hex || "",
      stock_quantity: stockQty,
      price_modifier: isNaN(priceMod) ? 0 : priceMod,
      is_default: Boolean(variantForm.is_default)
    };

    setForm((prev) => {
      let updatedVariants = [...(prev.variants || [])];
      if (normalizedVariant.is_default) {
        updatedVariants = updatedVariants.map((v) => ({ ...v, is_default: false }));
      }

      if (editingVariantIndex !== null && editingVariantIndex >= 0 && editingVariantIndex < updatedVariants.length) {
        updatedVariants[editingVariantIndex] = normalizedVariant;
      } else {
        updatedVariants.push(normalizedVariant);
      }

      return {
        ...prev,
        variants: updatedVariants
      };
    });

    setVariantForm(emptyVariant);
    setEditingVariantIndex(null);
    setShowVariantForm(false);
  };

  const removeVariant = (index) => {
    setForm((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== index)
    }));
    if (editingVariantIndex === index) {
      setShowVariantForm(false);
      setVariantForm(emptyVariant);
      setEditingVariantIndex(null);
    }
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="w-full max-w-6xl h-[94vh] sm:h-[90vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b bg-white rounded-t-2xl sm:rounded-t-3xl shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {initialData ? "Edit Product" : "Add Product"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
              Manage your product details, gallery and variants.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl hover:bg-gray-100 transition text-gray-500 flex items-center justify-center text-lg"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <form
          id="product-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 sm:py-8 space-y-8 sm:space-y-10"
        >
          {/* GENERAL INFORMATION */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">
              General Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="col-span-1 sm:col-span-2">
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
                <div className="col-span-1 sm:col-span-2">
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

              <div className="col-span-1 sm:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  rows={4}
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
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Product Variants
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Add unlimited sizes, colors, stock counts, and custom prices.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddVariant}
                className="rounded-xl bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-600 transition shadow-sm active:scale-95 flex items-center gap-1.5"
              >
                <span>+</span> Add Variant
              </button>
            </div>

            {form.variants.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-300 py-12 text-center bg-gray-50/50">
                <div className="text-5xl mb-3">📦</div>
                <p className="font-semibold text-gray-600">
                  No Variants Added
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Click "+ Add Variant" above to add product sizes, colors, and stock.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs uppercase font-semibold text-gray-500">
                        Size
                      </th>
                      <th className="px-5 py-4 text-left text-xs uppercase font-semibold text-gray-500">
                        Color
                      </th>
                      <th className="px-5 py-4 text-left text-xs uppercase font-semibold text-gray-500">
                        Stock
                      </th>
                      <th className="px-5 py-4 text-left text-xs uppercase font-semibold text-gray-500">
                        Price Modifier
                      </th>
                      <th className="px-5 py-4 text-left text-xs uppercase font-semibold text-gray-500">
                        Default
                      </th>
                      <th className="px-5 py-4 text-left text-xs uppercase font-semibold text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {form.variants.map((variant, index) => (
                      <tr key={index} className="hover:bg-gray-50/80 transition">
                        <td className="px-5 py-4 font-medium text-gray-800">{variant.size || "-"}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {variant.color_hex && (
                              <span
                                className="h-4 w-4 rounded-full border border-gray-300 shadow-xs shrink-0"
                                style={{ backgroundColor: variant.color_hex }}
                              />
                            )}
                            <span className="text-gray-700">{variant.color || "-"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${Number(variant.stock_quantity) > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {variant.stock_quantity ?? 0}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-700">
                          {Number(variant.price_modifier) >= 0 ? "+" : ""}
                          ₹{variant.price_modifier || 0}
                        </td>
                        <td className="px-5 py-4">
                          {variant.is_default ? (
                            <span className="inline-block rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-semibold text-pink-700">
                              Default
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleOpenEditVariant(variant, index)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm transition hover:underline"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="text-red-500 hover:text-red-700 font-medium text-sm transition hover:underline"
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
              <div
                ref={variantFormRef}
                className="mt-6 rounded-2xl border-2 border-pink-200 bg-gradient-to-b from-pink-50/40 to-white p-5 sm:p-6 shadow-sm scroll-mt-6 transition-all animate-fadeIn"
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-pink-100">
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-gray-900">
                      {editingVariantIndex !== null ? `Edit Variant #${editingVariantIndex + 1}` : "Add New Variant"}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {editingVariantIndex !== null ? "Modify variant attributes and stock" : "Fill details and click Save Variant"}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-pink-600 bg-pink-100 px-2.5 py-1 rounded-full">
                    {editingVariantIndex !== null ? "Editing" : "New"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Size <span className="text-gray-400 font-normal">(e.g. S, M, XL, 32)</span>
                    </label>
                    <input
                      ref={sizeInputRef}
                      placeholder="Size (e.g. M)"
                      value={variantForm.size}
                      onChange={(e) =>
                        setVariantForm({ ...variantForm, size: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 bg-white text-sm outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Color Name <span className="text-gray-400 font-normal">(e.g. Navy)</span>
                    </label>
                    <input
                      placeholder="Color name"
                      value={variantForm.color}
                      onChange={(e) =>
                        setVariantForm({
                          ...variantForm,
                          color: e.target.value
                        })
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 bg-white text-sm outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Color Swatch
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={variantForm.color_hex || "#000000"}
                        onChange={(e) =>
                          setVariantForm({
                            ...variantForm,
                            color_hex: e.target.value
                          })
                        }
                        className="rounded-xl border border-gray-300 h-[40px] w-12 p-1 cursor-pointer bg-white shrink-0"
                      />
                      <input
                        type="text"
                        placeholder="#000000"
                        value={variantForm.color_hex || ""}
                        onChange={(e) =>
                          setVariantForm({
                            ...variantForm,
                            color_hex: e.target.value
                          })
                        }
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-white text-xs font-mono outline-none focus:border-pink-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Stock (e.g. 10)"
                      value={variantForm.stock_quantity}
                      onChange={(e) =>
                        setVariantForm({
                          ...variantForm,
                          stock_quantity: e.target.value
                        })
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 bg-white text-sm outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Price Modifier <span className="text-gray-400 font-normal">(₹)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="+/- Price (e.g. 0)"
                      value={variantForm.price_modifier}
                      onChange={(e) =>
                        setVariantForm({
                          ...variantForm,
                          price_modifier: e.target.value
                        })
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 bg-white text-sm outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition"
                    />
                  </div>
                </div>

                <label className="mt-4 inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(variantForm.is_default)}
                    onChange={(e) =>
                      setVariantForm({
                        ...variantForm,
                        is_default: e.target.checked
                      })
                    }
                    className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                  />
                  <span>Default variant for catalog display</span>
                </label>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 mt-5 pt-4 border-t border-pink-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVariantForm(false);
                      setVariantForm(emptyVariant);
                      setEditingVariantIndex(null);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveVariant}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-pink-500 text-white text-sm font-semibold hover:bg-pink-600 transition text-center shadow-sm"
                  >
                    {editingVariantIndex !== null ? "Update Variant" : "Save Variant"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* PRODUCT INFORMATION (edit only) */}
          {initialData && (
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 sm:mb-6">
                Product Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Product ID
                  </p>
                  <p className="mt-1 sm:mt-2 text-base sm:text-lg font-semibold text-gray-800">
                    #{initialData.product_id}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Rating
                  </p>
                  <p className="mt-1 sm:mt-2 text-base sm:text-lg font-semibold text-yellow-500">
                    ⭐ {initialData.average_rating || "0.00"}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Reviews
                  </p>
                  <p className="mt-1 sm:mt-2 text-base sm:text-lg font-semibold text-gray-800">
                    {initialData.review_count || 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Created At
                  </p>
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-gray-700">
                    {initialData.created_at
                      ? new Date(initialData.created_at).toLocaleString()
                      : "-"}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-5">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Updated At
                  </p>
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-gray-700">
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
        <div className="border-t bg-white px-4 sm:px-8 py-3.5 sm:py-5 rounded-b-2xl sm:rounded-b-3xl shrink-0">
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end sm:justify-center gap-3 sm:gap-4 w-full">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="w-full sm:w-auto sm:min-w-[160px] rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100 transition text-sm text-center active:scale-[0.99]"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={saving}
              className="w-full sm:w-auto sm:min-w-[200px] rounded-xl bg-pink-500 px-6 py-3 font-semibold text-white hover:bg-pink-600 transition flex items-center justify-center gap-2 text-sm shadow-sm active:scale-[0.99]"
            >
              {saving && (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
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