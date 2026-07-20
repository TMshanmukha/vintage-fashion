import { useState } from "react";

/**
 * Simple create/edit modal for a promotional card.
 * Pass onClose() and onSubmit(formData) — onSubmit should call
 * cardApi.createCard(formData) or cardApi.updateCard(id, formData).
 */
export default function CardFormModal({ initialData, onClose, onSubmit }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [buttonText, setButtonText] = useState(initialData?.button_text || "");
  const [buttonLink, setButtonLink] = useState(initialData?.button_link || "/shop");
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order || 1);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900">
          {initialData ? "Edit Promotional Card" : "New Promotional Card"}
        </h3>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
          <input
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-pink-500 outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Buy 2 Get 1"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Subtitle</label>
          <input
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-pink-500 outline-none"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="On Selected Shirts"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Button Text
            </label>
            <input
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-pink-500 outline-none"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              placeholder="Shop Now"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Button Link
            </label>
            <input
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-pink-500 outline-none"
              value={buttonLink}
              onChange={(e) => setButtonLink(e.target.value)}
              placeholder="/shop"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {initialData ? "Replace Image (optional)" : "Card Image"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full text-sm"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-semibold"
          >
            {submitting ? "Saving…" : "Save Card"}
          </button>
        </div>
      </div>
    </div>
  );
}