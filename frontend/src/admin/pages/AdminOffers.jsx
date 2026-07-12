import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import { useSiteData } from "../../hooks/useSiteData";

export default function AdminOffers() {
  const { siteText, updateSiteText, addNotification } = useSiteData();
  const [form, setForm] = useState(siteText);
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm(siteText), [siteText]);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSave = (e) => {
    e.preventDefault();
    updateSiteText(form);
    addNotification({ title: "Homepage content updated", body: "Hero text and offers were changed", type: "content" });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout>
      <AdminTopbar title="Offers & Text" subtitle="Edit homepage copy, hero banner, and promotional text live." />

      <div className="p-8 max-w-3xl">
        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-6">
            ✓ Changes saved — your storefront has been updated.
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Hero section */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-1">Hero Banner</h2>
            <p className="text-xs text-gray-400 mb-5">The main banner shown at the top of your homepage.</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Eyebrow Text</label>
                <input
                  value={form.heroEyebrow}
                  onChange={(e) => handleChange("heroEyebrow", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Headline</label>
                <input
                  value={form.heroTitle}
                  onChange={(e) => handleChange("heroTitle", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Subtitle / Offer Text</label>
                <input
                  value={form.heroSubtitle}
                  onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Button Text</label>
                <input
                  value={form.heroCta}
                  onChange={(e) => handleChange("heroCta", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Announcement */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-1">Top Announcement Bar</h2>
            <p className="text-xs text-gray-400 mb-5">Promotional text shown at the very top of every page.</p>
            <input
              value={form.announcementText}
              onChange={(e) => handleChange("announcementText", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors"
            />
          </div>

          {/* New arrival section */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-1">New Arrival Section</h2>
            <p className="text-xs text-gray-400 mb-5">Subtitle text shown below the "New Arrival" heading.</p>
            <input
              value={form.newArrivalSubtitle}
              onChange={(e) => handleChange("newArrivalSubtitle", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors"
            />
          </div>

          {/* Preview */}
          <div className="bg-gray-900 rounded-xl p-8 text-right">
            <p className="text-xs text-gray-400 mb-1">Live Preview</p>
            <p className="text-gray-300 text-xs uppercase tracking-widest mb-1">{form.heroEyebrow}</p>
            <h3 className="text-3xl font-extrabold text-white mb-2">{form.heroTitle}</h3>
            <p className="text-sm text-gray-400 mb-4">{form.heroSubtitle}</p>
            <span className="inline-block border border-white text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5">
              {form.heroCta}
            </span>
          </div>

          <button type="submit" className="bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-lg hover:bg-pink-500 transition-colors">
            Save Changes
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
