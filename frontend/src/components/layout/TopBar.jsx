import { useEffect, useState } from "react";
import { getSettings } from "../../api/settingsApi";

const FALLBACKS = {
  language: "English",
  currency: "Rupee",
  support_phone: "99999-99999",
  announcement_text: "",
  announcement_enabled: false,
};

export default function TopBar() {
  const [settings, setSettings] = useState(FALLBACKS);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await getSettings();
        const data = res.data || {};
        if (!mounted) return;

        setSettings({
          language: data.language || FALLBACKS.language,
          currency: data.currency || FALLBACKS.currency,
          support_phone: data.support_phone || FALLBACKS.support_phone,
          announcement_text: data.announcement_text || "",
          announcement_enabled: !!data.announcement_enabled,
        });
      } catch (err) {
        console.error("Failed to load site settings:", err);
        // Falls back to FALLBACKS already set in initial state — bar still renders.
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="hidden md:block bg-white border-b border-gray-100 text-xs text-gray-500 px-4 sm:px-6 py-2">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap justify-center sm:justify-start">
          <span className="flex items-center gap-1 font-medium text-gray-600">
            {settings.language}
          </span>
          <span className="text-gray-300">·</span>
          <span className="flex items-center gap-1 font-medium text-gray-600">
            {settings.currency}
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-600">
            Call Us: <a href={`tel:${settings.support_phone}`} className="hover:text-pink-600 font-medium">{settings.support_phone}</a>
          </span>
        </div>
        {settings.announcement_enabled && settings.announcement_text && (
          <p className="text-center text-xs text-pink-600 font-medium tracking-wide line-clamp-1">{settings.announcement_text}</p>
        )}
      </div>
    </div>
  );
}