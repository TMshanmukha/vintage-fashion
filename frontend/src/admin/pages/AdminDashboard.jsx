import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import StatCard from "../components/StatCard";

import { getOrderStats, getOrders } from "../../api/orderApi";
import { getProducts } from "../../api/productApi";
import { getCustomers } from "../../api/userApi";
import { getNotifications } from "../../api/notificationApi";
import { getEmailLog } from "../../api/emailApi";

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const statusStyles = {
  Pending: "bg-gray-100 text-gray-600",
  Confirmed: "bg-sky-50 text-sky-700",
  Processing: "bg-amber-50 text-amber-700",
  Shipped: "bg-blue-50 text-blue-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-gray-100 text-gray-600",
  "Return requested": "bg-pink-50 text-pink-700",
  Returned: "bg-purple-50 text-purple-700",
};

const toDisplayStatus = (status) =>
  status
    ? status.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
    : "Pending";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [emailCount, setEmailCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);

        const [
          statsRes,
          ordersRes,
          productsRes,
          customersRes,
          notificationsRes,
          emailsRes,
        ] = await Promise.allSettled([
          getOrderStats(),
          getOrders({ limit: 5 }),
          getProducts({ limit: 100 }), // pulled client-side to derive low-stock; swap for a real ?lowStock=true param if backend supports it
          getCustomers(),
          getNotifications(),
          getEmailLog(),
        ]);

        if (cancelled) return;

        if (statsRes.status === "fulfilled") {
          setStats(statsRes.value);
        }

        if (ordersRes.status === "fulfilled") {
          setRecentOrders(ordersRes.value?.orders || []);
        }

        if (productsRes.status === "fulfilled") {
          const raw = productsRes.value;
          const allProducts = Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.data)
              ? raw.data
              : Array.isArray(raw?.data?.products)
                ? raw.data.products
                : Array.isArray(raw?.products)
                  ? raw.products
                  : [];

          if (allProducts.length === 0 && raw && !Array.isArray(raw)) {
            console.warn("getProducts() returned an unexpected shape:", raw);
          }

          setLowStockProducts(
            allProducts
              .filter((p) => (p.stock_quantity ?? 0) <= 5)
              .slice(0, 5)
          );
        }

        if (customersRes.status === "fulfilled") {
          setCustomers(customersRes.value || []);
        }

        if (notificationsRes.status === "fulfilled") {
          setNotifications(notificationsRes.value || []);
        }

        if (emailsRes.status === "fulfilled") {
          setEmailCount(
            Array.isArray(emailsRes.value) ? emailsRes.value.length : 0
          );
        }

        [statsRes, ordersRes, productsRes, customersRes, notificationsRes, emailsRes]
          .filter((r) => r.status === "rejected")
          .forEach((r) => console.error("Dashboard fetch failed:", r.reason));
      } catch (err) {
        console.error(err);
        toast.error("Couldn't load dashboard data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeCustomers = customers.filter((c) => c.status === "Active").length;
  const unreadNotifications = notifications.filter((n) => !n.is_read).length;

  if (loading) {
    return (
      <AdminLayout>
        <AdminTopbar title="Dashboard" subtitle="Loading your store overview..." />
        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminTopbar title="Dashboard" subtitle="Welcome back, here's what's happening with your store." />

      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          <StatCard
            label="Revenue"
            value={formatINR(stats?.total_revenue)}
            change="All-time"
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
          />
          <StatCard
            label="Orders"
            value={stats?.total_orders ?? 0}
            change={`${stats?.pending_orders ?? 0} pending`}
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />}
          />
          <StatCard
            label="Customers"
            value={customers.length}
            change={`${activeCustomers} active`}
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />}
          />
          <StatCard
            label="Low Stock"
            value={lowStockProducts.length}
            change="5 units or fewer"
            positive={lowStockProducts.length === 0}
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />}
          />
          <StatCard
            label="Return Requests"
            value={stats?.return_requested_orders ?? 0}
            change="Awaiting review"
            positive={(stats?.return_requested_orders ?? 0) === 0}
            icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent orders */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-gray-900">Recent Orders</h2>
              <Link to="/admin/orders" className="text-xs font-semibold text-pink-500 hover:underline">Manage all →</Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((o) => {
                  const displayStatus = toDisplayStatus(o.order_status);
                  return (
                    <div key={o.order_id} className="flex items-center gap-4 py-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          #{o.order_number}
                        </p>
                        <p className="text-xs text-gray-400">
                          {o.customer_name || "Customer"}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusStyles[displayStatus] || statusStyles.Pending
                          }`}
                      >
                        {displayStatus}
                      </span>
                      <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                        {formatINR(o.total_amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent notifications */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-gray-900">Recent Activity</h2>
              <Link to="/admin/notifications" className="text-xs font-semibold text-pink-500 hover:underline">View all →</Link>
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">Nothing new.</p>
            ) : (
              <div className="space-y-4">
                {notifications.slice(0, 4).map((n) => (
                  <div key={n.notification_id} className="flex items-start gap-3">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? "bg-gray-200" : "bg-pink-500"}`} />
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.created_at}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low stock alert row */}
        {lowStockProducts.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-6 mt-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-gray-900">Low Stock Products</h2>
              <Link to="/admin/products" className="text-xs font-semibold text-pink-500 hover:underline">Manage all →</Link>
            </div>
            <div className="space-y-3">
              {lowStockProducts.map((p) => (
                <div key={p.product_id} className="flex items-center gap-4 py-2">
                  {p.image_url && (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-11 h-11 rounded-lg object-cover bg-gray-50"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-red-500 font-medium">
                      {p.stock_quantity ?? 0} left
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{formatINR(p.price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
          <Link to="/admin/products" className="bg-gray-900 text-white rounded-xl p-6 hover:bg-gray-800 transition-colors">
            <p className="text-sm font-bold mb-1">+ Add New Product</p>
            <p className="text-xs text-gray-400">List a new item in your catalog</p>
          </Link>
          <Link to="/admin/offers" className="bg-pink-500 text-white rounded-xl p-6 hover:bg-pink-600 transition-colors">
            <p className="text-sm font-bold mb-1">Update Homepage Offer</p>
            <p className="text-xs text-pink-100">Edit banners, cards and flash sales</p>
          </Link>
          <Link to="/admin/emails" className="bg-white border border-gray-200 text-gray-900 rounded-xl p-6 hover:border-gray-900 transition-colors">
            <p className="text-sm font-bold mb-1">Email Subscribers</p>
            <p className="text-xs text-gray-400">{emailCount} emails sent so far</p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}