import { useState, useEffect } from "react";

const emptyForm = { name: "", price: "", originalPrice: "", badge: "", image: "" };

export default function ProductFormModal({ open, onClose, onSave, initialData }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        price: initialData.price ?? "",
        originalPrice: initialData.originalPrice ?? "",
        badge: initialData.badge || "",
        image: initialData.image || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: form.name,
      price: parseFloat(form.price) || 0,
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      badge: form.badge || null,
      image: form.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">{initialData ? "Edit Product" : "Add New Product"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Product Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Cream Knit Sweater"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Price ($)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="60.00"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Original Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.originalPrice}
                onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                placeholder="Optional"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Badge</label>
            <select
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 bg-white"
            >
              <option value="">None</option>
              <option value="New">New</option>
              <option value="-10%">-10% Off</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Image URL</label>
            <input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors"
            />
            {form.image && (
              <img src={form.image} alt="preview" className="w-20 h-20 object-cover rounded-lg mt-3 bg-gray-50" />
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-widest py-3 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-lg hover:bg-pink-500 transition-colors">
              {initialData ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
