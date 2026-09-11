import { useNavigate, Outlet } from "react-router-dom";
import { createContext, useContext, useState, useEffect, useCallback, Suspense } from "react";
import toast from "react-hot-toast";
import AdminSidebar from "./AdminSidebar";
import useAdminSocket from "../../hooks/Useadminsocket";
import { getNotifications } from "../../api/notificationApi";

const AdminLayoutContext = createContext(null);
export const useAdminLayout = () => useContext(AdminLayoutContext);

export default function AdminLayout({ children }) {
  const existingContext = useContext(AdminLayoutContext);
  if (existingContext) {
    // If already inside the persistent AdminLayout shell, just render content without re-wrapping
    return <>{children || <Outlet />}</>;
  }

  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifications = useCallback(async () => {
    try {
      const notifications = await getNotifications();
      if (Array.isArray(notifications)) {
        const count = notifications.filter((n) => !n.is_read).length;
        setUnreadCount(count);
      }
    } catch (err) {
      console.error("Failed to load notifications in AdminLayout:", err);
    }
  }, []);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  useAdminSocket({
    "admin:new-notification": (notification) => {
      setUnreadCount((c) => c + 1);
      toast(notification?.title || "New activity");
    },
    "session:changed": ({ event }) => {
      if (event === "logout") {
        localStorage.removeItem("admin");
        localStorage.removeItem("adminAccessToken");
        toast.error("Your session has ended.");
        navigate("/admin", { replace: true });
      }
    },
  });

  return (
    <AdminLayoutContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        unreadCount,
        setUnreadCount,
        refreshNotifications,
      }}
    >
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-64 min-w-0 flex flex-col">
          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center p-12 min-h-[60vh]">
                <div className="w-8 h-8 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin" />
              </div>
            }
          >
            {children || <Outlet />}
          </Suspense>
        </div>
      </div>
    </AdminLayoutContext.Provider>
  );
}