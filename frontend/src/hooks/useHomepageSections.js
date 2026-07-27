import { useEffect, useState } from "react";
import { getSections } from "../api/marketingApi";

export function useHomepageSections() {
  const [sections, setSections] = useState(null); // null = still loading

  useEffect(() => {
    let mounted = true;
    getSections()
      .then((res) => mounted && setSections(res.data?.data || []))
      .catch(() => mounted && setSections([]));
    return () => {
      mounted = false;
    };
  }, []);

  function isEnabled(sectionName) {
    if (sections === null) return true; // don't flash-hide sections while loading
    const found = sections.find((s) => s.section_name === sectionName);
    return found ? !!found.is_enabled : true; // default to visible if not seeded yet
  }

  return { sections, isEnabled, loading: sections === null };
}