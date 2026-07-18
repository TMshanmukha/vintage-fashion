import { useEffect, useState } from "react";

const emptyForm = { name: "", description: "" };

export default function BrandFormModal({
  open,
  onClose,
  onSave,
  initialData = null,
  saving = false
}) {
  const [form, setForm] = useState(emptyForm);
  const [isActive, setIsActive] = useState(true);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setForm({
        name: initialData.name || "",
        description: initialData.description || ""
      });
      setIsActive(Boolean(Number(initialData.is_active)));
      setLogoPreview(initialData.logo_url || null);
    } else {
      setForm(emptyForm);
      setIsActive(true);
      setLogoPreview(null);
    }

    setLogoFile(null);
  }, [initialData, open]);

  if (!open) return null;

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      logoFile,
      ...(initialData ? { is_active: isActive } : {})
    });
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-100";
  const labelClass = "text-sm font-semibold text-gray-700";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? "Edit Brand" : "Add Brand"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage brand name, logo and description.
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

        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
          {/* Logo */}
          <div>
            <label className={labelClass}>Logo</label>
            <div className="mt-2 flex items-center gap-5">
              <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">🏷️</span>
                )}
              </div>
              <div>
                <input
                  id="brand-logo"
                  type="file"
                  accept="image/*"
                  disabled={saving}
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <label
                  htmlFor="brand-logo"
                  className="cursor-pointer inline-block rounded-xl bg-pink-500 px-5 py-2 text-sm font-semibold text-white hover:bg-pink-600 transition"
                >
                  {logoPreview ? "Change Logo" : "Upload Logo"}
                </label>
                <p className="mt-2 text-xs text-gray-400">
                  PNG, JPG or WEBP.
                </p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className={labelClass}>Brand Name</label>
            <input
              type="text"
              required
              value={form.name}
              disabled={saving}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
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

          {/* Status — edit only */}
          {initialData && (
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={isActive ? "true" : "false"}
                disabled={saving}
                onChange={(e) => setIsActive(e.target.value === "true")}
                className={inputClass}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          )}
        </div>

        <div className="border-t bg-white px-8 py-5 rounded-b-3xl">
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="min-w-[160px] rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-w-[200px] rounded-xl bg-pink-500 px-6 py-3 font-semibold text-white hover:bg-pink-600 transition flex items-center justify-center gap-3"
            >
              {saving && (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {saving
                ? "Saving..."
                : initialData
                ? "Save Changes"
                : "Create Brand"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}