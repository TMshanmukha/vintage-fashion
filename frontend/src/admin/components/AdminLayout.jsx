import { useNavigate } from "react-router-dom";
import { createContext, useContext, useState } from "react";
import toast from "react-hot-toast";
import AdminSidebar from "./AdminSidebar";
import useAdminSocket from "../../hooks/Useadminsocket";

const AdminLayoutContext = createContext();
export const useAdminLayout = () => useContext(AdminLayoutContext);

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mounted on every admin page (AdminLayout wraps them all), so both of
  // these fire no matter which page the admin is currently on.
  useAdminSocket({
    "admin:new-notification": (notification) => {
      toast(notification.title || "New activity");
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
    <AdminLayoutContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-64 min-w-0 flex flex-col">{children}</div>
      </div>
    </AdminLayoutContext.Provider>
  );
}