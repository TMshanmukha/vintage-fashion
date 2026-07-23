import { useEffect, useState } from "react";
import { getSiteSettings } from "../../api/marketingApi";

export default function AnnouncementBar() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let mounted = true;
    getSiteSettings()
      .then((res) => mounted && setSettings(res.data?.data || null))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  if (!settings?.announcement_enabled || !settings?.announcement_text) return null;

  return (
    <div className="bg-gray-900 text-white text-xs md:text-sm text-center py-2 px-4 tracking-wide">
      {settings.announcement_text}
    </div>
  );
}