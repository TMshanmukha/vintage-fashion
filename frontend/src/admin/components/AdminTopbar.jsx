import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getNotifications } from "../../api/notificationApi";
import useAdminSocket from "../../hooks/Useadminsocket";
import { useAdminLayout } from "./AdminLayout";

export default function AdminTopbar({ title, subtitle }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const notifications = await getNotifications();
        setUnreadCount(notifications.filter((n) => !n.is_read).length);
      } catch (err) {
        console.error(err);
      }
    };

    loadUnreadCount();
  }, []);

  useAdminSocket({
      "admin:new-notification": () => {
          setUnreadCount((count) => count + 1);
      },
  });

  const { setSidebarOpen } = useAdminLayout() || {};

  return (
    <header className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3 min-w-0">
        {setSidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-pink-500 transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100"
            aria-label="Open sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-gray-400 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        <Link
            to="/admin/notifications"
            onClick={() => setUnreadCount(0)}
            className="relative text-gray-500 hover:text-pink-500 transition-colors p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </Link>
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
          A
        </div>
      </div>
    </header>
  );
}