import { useEffect, useState } from "react";

export default function CardFormModal({ categories = [], initialData, onClose, onSubmit }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [buttonText, setButtonText] = useState(initialData?.button_text || "");
  const [buttonLink, setButtonLink] = useState(initialData?.button_link || "/shop");
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order || 1);
  const [categoryId, setCategoryId] = useState(initialData?.category_id || "");
  const [discountPercent, setDiscountPercent] = useState(initialData?.discount_percent || "");
  const [linkTouched, setLinkTouched] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Auto-build the link from category + discount unless the admin typed their own.
  useEffect(() => {
    if (linkTouched) return;
    if (categoryId) {
      const params = new URLSearchParams();
      params.set("category", categoryId);
      if (discountPercent) params.set("discount", discountPercent);
      setButtonLink(`/shop?${params.toString()}`);
    }
  }, [categoryId, discountPercent, linkTouched]);

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!initialData && !imageFile) {
      setError("An image is required for a new card.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subtitle", subtitle);
      formData.append("button_text", buttonText);
      formData.append("button_link", buttonLink);
      formData.append("display_order", displayOrder);
      if (categoryId) formData.append("category_id", categoryId);
      if (discountPercent) formData.append("discount_percent", discountPercent);
      if (imageFile) formData.append("image", imageFile);

      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || "Could not save the card. Check the fields."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900">
          {initialData ? "Edit Promotional Card" : "New Promotional Card"}
        </h3>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-lg px-4 py-2.5">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Title</label>
          <input
            className="w-full rounded-xl border border-gray-300 px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Buy 2 Get 1"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Subtitle</label>
          <input
            className="w-full rounded-xl border border-gray-300 px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="On Selected Shirts"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Category</label>
            <select
              className="w-full rounded-xl border border-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none bg-white"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">No category (plain link)</option>
              {categories.map((cat) => (
                <option key={cat.category_id} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
              Discount %
            </label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              placeholder="10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
              Button Text
            </label>
            <input
              className="w-full rounded-xl border border-gray-300 px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="Shop Now"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
              Button Link
            </label>
            <input
              className="w-full rounded-xl border border-gray-300 px-4 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              value={buttonLink}
              onChange={(e) => {
                setLinkTouched(true);
                setButtonLink(e.target.value);
              }}
              placeholder="/shop"
            />
            {categoryId && !linkTouched && (
              <p className="text-[10px] text-gray-400 mt-1">
                Auto-generated from category + discount.
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
            {initialData ? "Replace Image (optional)" : "Card Image"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full text-xs sm:text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100"
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            {submitting ? "Saving…" : "Save Card"}
          </button>
        </div>
      </div>
    </div>
  );
}
