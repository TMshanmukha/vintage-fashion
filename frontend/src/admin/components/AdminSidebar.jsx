import { NavLink } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useSiteData } from "../../hooks/useSiteData";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  ) },
  { to: "/admin/products", label: "Products", icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  ) },
  { to: "/admin/offers", label: "Offers & Text", icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.169.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
  ) },
  { to: "/admin/users", label: "Users", icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  ) },
  { to: "/admin/notifications", label: "Notifications", icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  ) },
  { to: "/admin/emails", label: "Email Center", icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  ) },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const { notifications } = useSiteData();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {

      try {

          await logout();

          toast.success("Logged out successfully.");

          navigate("/admin");

      } catch (error) {

          toast.error("Logout failed.");

          console.error(error);

      }

  };

  return (
    <aside className="w-64 bg-gray-950 min-h-screen flex flex-col fixed left-0 top-0 bottom-0">
      <div className="px-6 py-6 border-b border-gray-800">
        <h1 className="text-xl font-extrabold text-white">Flone<span className="text-pink-500">.</span></h1>
        <p className="text-xs text-gray-500 mt-0.5">Admin Dashboard</p>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-pink-500 text-white" : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`
            }
          >
            <span className="flex items-center gap-3">
              <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {item.icon}
              </svg>
              {item.label}
            </span>
            {item.label === "Notifications" && unreadCount > 0 && (
              <span className="bg-pink-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-6 border-t border-gray-800 space-y-1">
        <NavLink to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-900 hover:text-white transition-colors">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h-3a3 3 0 00-3 3v9a3 3 0 003 3h9a3 3 0 003-3v-3M21 3l-9 9m0 0V8.25M12 12h3.75" />
          </svg>
          View Store
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Log Out
        </button>
      </div>
    </aside>
  );
}
