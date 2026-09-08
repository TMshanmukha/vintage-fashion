import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import toast from "react-hot-toast";
import {
  getOrders,
  updatePaymentStatus,
  getOrderStats,
  confirmOrder,
  cancelOrder,
  createShipment,
  trackShipment,
  cancelShipment,
} from "../../api/orderApi";
import useAdminSocket from "../../hooks/Useadminsocket";

const PAYMENT_STATUSES = ["pending", "success", "failed", "refunded"];

const orderStatusStyles = {
  pending: "bg-amber-50 text-amber-600 border border-amber-200",
  confirmed: "bg-sky-50 text-sky-600 border border-sky-200",
  processing: "bg-indigo-50 text-indigo-600 border border-indigo-200",
  shipped: "bg-purple-50 text-purple-600 border border-purple-200",
  delivered: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  cancelled: "bg-red-50 text-red-500 border border-red-200",
  returned: "bg-gray-100 text-gray-600 border border-gray-200",
  return_requested: "bg-pink-50 text-pink-600 border border-pink-200",
};

const paymentStatusStyles = {
  pending: "bg-amber-50 text-amber-600 border border-amber-200",
  paid: "bg-green-50 text-green-600 border border-green-200",
  success: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  failed: "bg-red-50 text-red-500 border border-red-200",
  refunded: "bg-gray-100 text-gray-600 border border-gray-200"
};

const formatCurrency = (value) => `₹${Number(value).toLocaleString("en-IN")}`;

const formatDate = (isoString) =>
  new Date(isoString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const formatStatusLabel = (s) =>
  (s || "").split("_").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState(null); // order_id currently mid-action
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

  useAdminSocket({
    "admin:order-updated": ({ orderId, order_status }) => {
      setOrders((current) =>
        current.map((o) => (o.order_id === orderId ? { ...o, order_status } : o))
      );
      loadStats();
    },
  });

  const handleConfirm = async (order) => {
    setActionLoadingId(order.order_id);
    try {
      await confirmOrder(order.order_id);
      toast.success("Order confirmed.");
      loadOrders();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm order.");
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (order) => {
    const confirmed = window.confirm(
      `Cancel order #${order.order_number}? This can't be easily undone.`
    );
    if (!confirmed) return;

    setActionLoadingId(order.order_id);
    try {
      await cancelOrder(order.order_id);
      toast.success("Order cancelled.");
      loadOrders();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order.");
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelShipment = async (order) => {
    const confirmed = window.confirm(
      `Cancel the courier shipment for order #${order.order_number}? This can't be undone.`
    );
    if (!confirmed) return;

    setActionLoadingId(order.order_id);
    try {
      await cancelShipment(order.order_id);
      toast.success("Shipment cancelled.");
      loadOrders();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel shipment.");
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleScheduleCourier = async (order) => {
    setActionLoadingId(order.order_id);
    try {
      const res = await createShipment(order.order_id);
      toast.success(res.message || "Shipment created with courier.");
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create shipment.");
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRefreshTracking = async (order) => {
    setActionLoadingId(order.order_id);
    try {
      await trackShipment(order.order_id);
      toast.success("Tracking refreshed.");
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to refresh tracking.");
      console.error(err);
    } finally {
      setActionLoadingId(null);
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

      <div className="p-4 sm:p-6 lg:p-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
            <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-sm">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-gray-400">Total Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stats.total_orders}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-sm">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-gray-400">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-500 mt-1">{stats.pending_orders}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-sm">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-gray-400">Delivered</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{stats.delivered_orders}</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-sm">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-gray-400">Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.total_revenue)}</p>
            </div>
            <Link
              to="/admin/returns"
              className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 hover:border-pink-300 transition-colors shadow-sm col-span-2 sm:col-span-1"
            >
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-gray-400">Return Requests</p>
              <p className="text-xl sm:text-2xl font-bold text-pink-500 mt-1">{stats.return_requested_orders ?? 0}</p>
            </Link>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div className="relative w-full sm:w-72">
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search order #, name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors bg-white"
            />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 bg-white"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <p className="text-xs text-gray-400 whitespace-nowrap">{total} order{total !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200/60 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold uppercase tracking-widest text-gray-500">
                <th className="text-left px-6 py-4">Order</th>
                <th className="text-left px-6 py-4">Customer</th>
                <th className="text-left px-6 py-4">Items</th>
                <th className="text-left px-6 py-4">Total</th>
                <th className="text-left px-6 py-4">Order Status</th>
                <th className="text-left px-6 py-4">Shipping Status</th>
                <th className="text-left px-6 py-4">Payment</th>
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-left px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-400">Loading orders...</td></tr>
              )}
              {!loading && orders.map((o) => {
                const isPending = o.order_status === "pending";
                const isConfirmed = o.order_status === "confirmed";
                const isCancelled = o.order_status === "cancelled";
                const hasShipment = !!o.shipment_id;
                const busy = actionLoadingId === o.order_id;
                const resolvedPaymentStatus = o.payment_status === "paid" ? "success" : o.payment_status;

                return (
                  <tr key={o.order_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">#{o.order_number}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{o.customer_name}</p>
                      <p className="text-xs text-gray-400">{o.customer_email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{o.item_count}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">{formatCurrency(o.total_amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-full ${orderStatusStyles[o.order_status] || orderStatusStyles.pending}`}>
                        {formatStatusLabel(o.order_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {!hasShipment ? (
                        <span className="text-xs text-gray-400 italic">Not shipped</span>
                      ) : (
                        <div className="text-xs">
                          <p className="font-semibold text-gray-700">{formatStatusLabel(o.shipping_status) || "Awaiting update"}</p>
                          {o.awb_number && <p className="text-gray-400 mt-0.5">AWB: {o.awb_number}</p>}
                          {o.courier_name && <p className="text-gray-400">{o.courier_name}</p>}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={resolvedPaymentStatus}
                        onChange={(e) => handlePaymentStatusChange(o.order_id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-full outline-none border border-transparent focus:border-pink-500 cursor-pointer ${paymentStatusStyles[resolvedPaymentStatus] || paymentStatusStyles.pending}`}
                      >
                        {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(o.ordered_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleConfirm(o)}
                              disabled={busy}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-500 text-white hover:bg-sky-600 transition-colors disabled:opacity-50"
                            >
                              {busy ? "Working…" : "Confirm"}
                            </button>
                            <button
                              onClick={() => handleCancel(o)}
                              disabled={busy}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              {busy ? "Working…" : "Cancel"}
                            </button>
                          </>
                        )}
                        {isConfirmed && !hasShipment && (
                          <>
                            <button
                              onClick={() => handleScheduleCourier(o)}
                              disabled={busy}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors disabled:opacity-50"
                            >
                              {busy ? "Working…" : "Schedule"}
                            </button>
                            <button
                              onClick={() => handleCancel(o)}
                              disabled={busy}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              {busy ? "Working…" : "Cancel"}
                            </button>
                          </>
                        )}
                        {hasShipment && !isCancelled && (
                          <>
                            <button
                              onClick={() => handleRefreshTracking(o)}
                              disabled={busy}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-pink-500 hover:text-pink-500 transition-colors disabled:opacity-50"
                            >
                              {busy ? "Working…" : "Track"}
                            </button>
                            <button
                              onClick={() => handleCancelShipment(o)}
                              disabled={busy}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              {busy ? "Working…" : "Cancel Ship"}
                            </button>
                          </>
                        )}
                        {!isCancelled && !hasShipment && !isPending && !isConfirmed && (
                          <button
                            onClick={() => handleCancel(o)}
                            disabled={busy}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {busy ? "Working…" : "Cancel"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && orders.length === 0 && (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-400">No orders found.</td></tr>
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