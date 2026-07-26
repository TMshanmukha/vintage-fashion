import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AdminSidebar from "./AdminSidebar";
import useAdminSocket from "../../hooks/useAdminSocket";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  // Mounted on every admin page (AdminLayout wraps them all), so both of
  // these fire no matter which page the admin is currently on.
  useAdminSocket({
    "admin:new-notification": (notification) => {
      toast(notification.title || "New activity");
      // If/when you want a persistent unread badge in AdminSidebar rather
      // than just a toast, that state needs to live somewhere shared —
      // either lift it into a context here, or have AdminSidebar itself
      // call useAdminSocket. Happy to wire that once I see AdminSidebar.jsx.
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
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">{children}</div>
    </div>
  );
}