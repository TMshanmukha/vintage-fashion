import { useState, useEffect } from "react";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  originalPrice: "",
  stock: "",
  badge: "",
  category_id: "",
  image: "",
};

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function ProductFormModal({
  open,
  onClose,
  onSave,
  initialData,
  categories = [],
  saving = false,
}) {
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        price: initialData.price ?? "",
        originalPrice: initialData.originalPrice ?? "",
        stock: initialData.stock ?? "",
        badge: initialData.badge || "",
        category_id: initialData.category_id || "",
        image: initialData.image || "",
      });
      setSlugTouched(true);
    } else {
      setForm(emptyForm);
      setSlugTouched(false);
    }
  }, [initialData, open]);

  if (!open) return null;

  const handleNameChange = (value) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: parseFloat(form.price) || 0,
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
      stock: form.stock === "" ? 0 : parseInt(form.stock, 10),
      badge: form.badge || null,
      category_id: form.category_id || null,
      image: form.image || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">{initialData ? "Edit Product" : "Add New Product"}</h3>
          <button onClick={onClose} disabled={saving} className="text-gray-400 hover:text-gray-700 disabled:opacity-50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-8 space-y-6"
          >
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Product Name</label>
            <input
              required
              disabled={saving}
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Cream Knit Sweater"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Slug</label>
            <input
              required
              disabled={saving}
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm({ ...form, slug: e.target.value });
              }}
              placeholder="cream-knit-sweater"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Category</label>
            <select
              required
              disabled={saving}
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 bg-white disabled:bg-gray-50"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Description</label>
            <textarea
              rows={3}
              disabled={saving}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short product description..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors disabled:bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Price ($)</label>
              <input
                required
                disabled={saving}
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="60.00"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Original Price ($)</label>
              <input
                disabled={saving}
                type="number"
                step="0.01"
                min="0"
                value={form.originalPrice}
                onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                placeholder="Optional"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors disabled:bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Stock</label>
              <input
                required
                disabled={saving}
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="0"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Badge</label>
              <select
                disabled={saving}
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 bg-white disabled:bg-gray-50"
              >
                <option value="">None</option>
                <option value="New">New</option>
                <option value="-10%">-10% Off</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Image URL</label>
            <input
              disabled={saving}
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors disabled:bg-gray-50"
            />
            {form.image && (
              <img src={form.image} alt="preview" className="w-20 h-20 object-cover rounded-lg mt-3 bg-gray-50" />
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={saving} className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-widest py-3 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-lg hover:bg-pink-500 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {saving ? "Saving..." : initialData ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}