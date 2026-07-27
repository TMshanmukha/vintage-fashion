import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getNotifications } from "../../api/notificationApi";
import useAdminSocket from "../../hooks/Useadminsocket";

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

  return (
    <header className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <Link
            to="/admin/notifications"
            onClick={() => setUnreadCount(0)}
            className="relative text-gray-500 hover:text-pink-500 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </Link>
        <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold">
          A
        </div>
      </div>
    </header>
  );
}