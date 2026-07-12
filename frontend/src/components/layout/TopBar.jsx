import { useSiteData } from "../../hooks/useSiteData";

export default function TopBar() {
  const { siteText } = useSiteData();
  return (
    <div className="bg-white border-b border-gray-100 text-xs text-gray-500 px-6 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            English
            {/* <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg> */}
          </span>
          <span className="flex items-center gap-1">
            Rupee
            {/* <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg> */}
          </span>
          <span>|</span>
          <span>Call Us 99999-99999</span>
        </div>
        <p className="text-center text-xs">{siteText.announcementText}</p>
      </div>
    </div>
  );
}
