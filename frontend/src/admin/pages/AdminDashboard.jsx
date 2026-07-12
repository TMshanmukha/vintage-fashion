import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import StatCard from "../components/StatCard";
import { useSiteData } from "../../hooks/useSiteData";

export default function AdminDashboard() {
  const { products, users, notifications, emailLog } = useSiteData();

  const totalRevenuePotential = products.reduce((sum, p) => sum + p.price, 0);
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const lowStockCount = products.filter((p) => p.badge === "-10%").length;

  return (
    <AdminLayout>
      <AdminTopbar title="Dashboard" subtitle="Welcome back, here's what's happening with your store." />

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            label="Total Products"
            value={products.length}
            change="2 added this week"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />}
          />
          <StatCard
            label="Total Users"
            value={users.length}
            change={`${activeUsers} active`}
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />}
          />
          <StatCard
            label="Catalog Value"
            value={`$${totalRevenuePotential.toFixed(0)}`}
            change="Across all products"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
          />
          <StatCard
            label="Unread Alerts"
            value={notifications.filter((n) => !n.read).length}
            change={`${notifications.length} total`}
            positive={false}
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent products */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-gray-900">Recent Products</h2>
              <Link to="/admin/products" className="text-xs font-semibold text-pink-500 hover:underline">Manage all →</Link>
            </div>
            <div className="space-y-3">
              {products.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center gap-4 py-2">
                  <img src={p.image} alt={p.name} className="w-11 h-11 rounded-lg object-cover bg-gray-50" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.badge || "Standard"}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">${p.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent notifications */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-gray-900">Recent Activity</h2>
              <Link to="/admin/notifications" className="text-xs font-semibold text-pink-500 hover:underline">View all →</Link>
            </div>
            <div className="space-y-4">
              {notifications.slice(0, 4).map((n) => (
                <div key={n.id} className="flex items-start gap-3">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? "bg-gray-200" : "bg-pink-500"}`} />
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
          <Link to="/admin/products" className="bg-gray-900 text-white rounded-xl p-6 hover:bg-gray-800 transition-colors">
            <p className="text-sm font-bold mb-1">+ Add New Product</p>
            <p className="text-xs text-gray-400">List a new item in your catalog</p>
          </Link>
          <Link to="/admin/offers" className="bg-pink-500 text-white rounded-xl p-6 hover:bg-pink-600 transition-colors">
            <p className="text-sm font-bold mb-1">Update Homepage Offer</p>
            <p className="text-xs text-pink-100">Edit hero text and promotions</p>
          </Link>
          <Link to="/admin/emails" className="bg-white border border-gray-200 text-gray-900 rounded-xl p-6 hover:border-gray-900 transition-colors">
            <p className="text-sm font-bold mb-1">Email Subscribers</p>
            <p className="text-xs text-gray-400">{emailLog.length} emails sent so far</p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
