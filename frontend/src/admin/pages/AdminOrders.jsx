import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import toast from "react-hot-toast";
import { getOrders, updateOrderStatus, updatePaymentStatus, getOrderStats } from "../../api/orderApi";

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];
const PAYMENT_STATUSES = ["pending", "success", "failed", "refunded"];

// Only these forward moves are allowed from a given status — plus the current
// value itself so the <select> always has something to display. This stops
// an accidental jump straight to "delivered" from "pending", since shipping
// here is manual (you hand the parcel to the post office yourself) and the
// status should always reflect a truthful, ordered history rather than
// whatever an admin clicks.
const ALLOWED_NEXT_STATUSES = {
  pending: ["pending", "confirmed", "cancelled"],
  confirmed: ["confirmed", "processing", "cancelled"],
  processing: ["processing", "shipped", "cancelled"],
  shipped: ["shipped", "delivered"],
  delivered: ["delivered", "returned"],
  cancelled: ["cancelled"],
  returned: ["returned"],
};

const orderStatusStyles = {
  pending: "bg-amber-50 text-amber-600",
  confirmed: "bg-blue-50 text-blue-600",
  processing: "bg-purple-50 text-purple-600",
  shipped: "bg-indigo-50 text-indigo-600",
  delivered: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-500",
  returned: "bg-gray-100 text-gray-600"
};

const paymentStatusStyles = {
  pending: "bg-amber-50 text-amber-600",
  paid: "bg-green-50 text-green-600",
  failed: "bg-red-50 text-red-500",
  refunded: "bg-gray-100 text-gray-600"
};

const formatCurrency = (value) => `₹${Number(value).toLocaleString("en-IN")}`;

const formatDate = (isoString) =>
  new Date(isoString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOrders({ status: status || undefined, search: search || undefined, page, limit });
      setOrders(data.orders);
      setTotal(data.total);
    } catch (err) {
      toast.error("Failed to load orders.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [status, search, page]);

  const loadStats = async () => {
    try {
      const data = await getOrderStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    loadStats();
  }, []);

  const handleOrderStatusChange = async (order, newStatus) => {
    if (newStatus === order.order_status) return;

    if (newStatus === "cancelled" || newStatus === "delivered" || newStatus === "returned") {
      const confirmed = window.confirm(
        `Mark order #${order.order_number} as "${newStatus}"? This can't be easily undone.`
      );
      if (!confirmed) return;
    }

    try {
      await updateOrderStatus(order.order_id, newStatus);
      toast.success("Order status updated.");
      loadOrders();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order status.");
      console.error(err);
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      await updatePaymentStatus(orderId, newStatus);
      toast.success("Payment status updated.");
      loadOrders();
      loadStats();
    } catch (err) {
      toast.error("Failed to update payment status.");
      console.error(err);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <AdminLayout>
      <AdminTopbar title="Orders" subtitle="Every order placed, who placed it, and where it stands." />

      <div className="p-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_orders}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-amber-500 mt-1">{stats.pending_orders}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Delivered</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.delivered_orders}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.total_revenue)}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center justify-between mb-6 gap-3">
          <div className="relative w-72">
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search order #, customer name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors bg-white"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 bg-white"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>
          <p className="text-xs text-gray-400 whitespace-nowrap">{total} order{total !== 1 ? "s" : ""}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold uppercase tracking-widest text-gray-500">
                <th className="text-left px-6 py-4">Order</th>
                <th className="text-left px-6 py-4">Customer</th>
                <th className="text-left px-6 py-4">Items</th>
                <th className="text-left px-6 py-4">Total</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Payment</th>
                <th className="text-left px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">Loading orders...</td></tr>
              )}
              {!loading && orders.map((o) => {
                const allowedNext = ALLOWED_NEXT_STATUSES[o.order_status] || [o.order_status];

                return (
                  <tr key={o.order_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">#{o.order_number}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-800">{o.customer_name}</p>
                      <p className="text-xs text-gray-400">{o.customer_email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{o.item_count}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">{formatCurrency(o.total_amount)}</td>
                    <td className="px-6 py-4">
                      <select
                        value={o.order_status}
                        onChange={(e) => handleOrderStatusChange(o, e.target.value)}
                        disabled={allowedNext.length === 1}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-full outline-none border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 ${orderStatusStyles[o.order_status] || orderStatusStyles.pending}`}
                      >
                        {allowedNext.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={o.payment_status === "paid" ? "success" : o.payment_status}
                        onChange={(e) => handlePaymentStatusChange(o.order_id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-full outline-none border-0 cursor-pointer ${paymentStatusStyles[o.payment_status] || paymentStatusStyles.pending}`}
                      >
                        {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(o.ordered_at)}</td>
                  </tr>
                );
              })}
              {!loading && orders.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:border-gray-900 transition-colors"
            >
              Prev
            </button>
            <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:border-gray-900 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}