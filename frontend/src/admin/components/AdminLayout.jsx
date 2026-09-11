import { useNavigate, Outlet } from "react-router-dom";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import AdminSidebar from "./AdminSidebar";
import useAdminSocket from "../../hooks/Useadminsocket";
import { getNotifications } from "../../api/notificationApi";

const AdminLayoutContext = createContext(null);
export const useAdminLayout = () => useContext(AdminLayoutContext);

export default function AdminLayout({ children }) {
  const existingContext = useContext(AdminLayoutContext);
  if (existingContext) {
    // If already inside the persistent AdminLayout shell, just render content without remounting sidebar
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
        <div className="flex-1 lg:ml-64 min-w-0 flex flex-col">{children || <Outlet />}</div>
      </div>
    </AdminLayoutContext.Provider>
  );
}