import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import ConfirmDialog from "../components/ConfirmDialog";
import toast from "react-hot-toast";
import {
  getOrders,
  updatePaymentStatus,
  syncPaymentStatus,
  getOrderStats,
  confirmOrder,
  cancelOrder,
  createShipment,
  trackShipment,
  cancelShipment,
} from "../../api/orderApi";
import {
  updateOrderDeliveryMethod,
  updateLocalDeliveryStatus,
  getShippingLabel,
  getShippingInvoice,
} from "../../api/shippingApi";
import useAdminSocket from "../../hooks/Useadminsocket";

const PAYMENT_STATUSES = ["pending", "success", "failed", "refunded"];

const ORDER_TABS = [
  { key: "", label: "All Orders" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const orderStatusStyles = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500", label: "Pending" },
  confirmed: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", dot: "bg-sky-500", label: "Confirmed" },
  processing: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", dot: "bg-indigo-500", label: "Processing" },
  shipped: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500", label: "Shipped / In Transit" },
  delivered: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", label: "Delivered" },
  cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", label: "Cancelled" },
  returned: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300", dot: "bg-gray-500", label: "Returned" },
  return_requested: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200", dot: "bg-pink-500", label: "Return Requested" },
};

const paymentStatusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-gray-100 text-gray-700 border-gray-300",
};

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (isoString) =>
  isoString
    ? new Date(isoString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

const formatStatusLabel = (s) =>
  orderStatusStyles[s]?.label ||
  (s || "").split("_").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");

const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [cancelTargetOrder, setCancelTargetOrder] = useState(null);
  const [cancelShipmentTarget, setCancelShipmentTarget] = useState(null);
  const limit = 20;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setFetching(true);
    try {
      const data = await getOrders({
        status: status || undefined,
        search: debouncedSearch || undefined,
        page,
        limit,
      });
      setOrders(Array.isArray(data?.orders) ? data.orders : []);
      setTotal(data?.total || 0);
    } catch (err) {
      toast.error("Failed to load orders.");
      console.error(err);
    } finally {
      setInitialLoading(false);
      setFetching(false);
    }
  }, [status, debouncedSearch, page]);

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
    "admin:order-updated": (data) => {
      setOrders((current) =>
        current.map((o) => (o.order_id === data.orderId ? { ...o, ...data } : o))
      );
      loadStats();
    },
    "admin:order-created": () => {
      loadOrders(true);
      loadStats();
    },
  });

  const handleTabChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleDeliveryMethodChange = async (orderId, newMethod) => {
    setActionLoadingId(orderId);
    try {
      await updateOrderDeliveryMethod(orderId, newMethod);
      toast.success(`Delivery method updated to ${newMethod}.`);
      setOrders((prev) =>
        prev.map((o) => (o.order_id === orderId ? { ...o, delivery_method: newMethod } : o))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update delivery method.");
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLocalStatusChange = async (orderId, action) => {
    setActionLoadingId(orderId);
    try {
      const res = await updateLocalDeliveryStatus(orderId, action);
      toast.success(res.message || "Local delivery status updated.");
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === orderId
            ? { ...o, order_status: res.order_status, shipping_status: res.shipping_status }
            : o
        )
      );
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update local delivery status.");
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirm = async (order) => {
    setActionLoadingId(order.order_id);
    try {
      await confirmOrder(order.order_id);
      toast.success(`Order #${order.order_number} confirmed.`);
      loadOrders(true);
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm order.");
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelTargetOrder) return;
    const order = cancelTargetOrder;
    setActionLoadingId(order.order_id);
    try {
      await cancelOrder(order.order_id);
      toast.success(`Order #${order.order_number} cancelled.`);
      setCancelTargetOrder(null);
      loadOrders(true);
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order.");
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelShipment = async () => {
    if (!cancelShipmentTarget) return;
    const order = cancelShipmentTarget;
    setActionLoadingId(order.order_id);
    try {
      await cancelShipment(order.order_id);
      toast.success(`Shipment for #${order.order_number} cancelled.`);
      setCancelShipmentTarget(null);
      loadOrders(true);
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
      loadOrders(true);
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
      toast.success("Tracking status refreshed.");
      loadOrders(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to refresh tracking.");
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePrintLabel = async (order) => {
    if (order.shipping_label_url) {
      window.open(order.shipping_label_url, "_blank");
      return;
    }
    setActionLoadingId(order.order_id);
    try {
      const res = await getShippingLabel(order.order_id);
      const url = res.data?.label_url || res.data?.data?.label_url || res.data?.response?.label_url;
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.error("Shipping label is still generating in Shiprocket. Please retry in a few moments.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch shipping label.");
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePrintInvoice = async (order) => {
    if (order.invoice_url) {
      window.open(order.invoice_url, "_blank");
      return;
    }
    setActionLoadingId(order.order_id);
    try {
      const res = await getShippingInvoice(order.order_id);
      const url = res.data?.invoice_url || res.data?.data?.invoice_url || res.data?.response?.invoice_url;
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.error("Invoice is still generating in Shiprocket. Please retry in a few moments.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch invoice.");
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      await updatePaymentStatus(orderId, newStatus);
      toast.success("Payment status updated.");
      setOrders((prev) =>
        prev.map((o) => (o.order_id === orderId ? { ...o, payment_status: newStatus } : o))
      );
      loadStats();
    } catch (err) {
      toast.error("Failed to update payment status.");
      console.error(err);
    }
  };

  const handleSyncPayment = async (orderId) => {
    setActionLoadingId(orderId);
    try {
      const res = await syncPaymentStatus(orderId);
      if (res.success) {
        toast.success(res.message || "Payment verified & updated!");
        loadOrders(true);
        loadStats();
      } else {
        toast.error(res.message || "No captured payment found in Razorpay.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to sync with Razorpay.");
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <AdminLayout>
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        <AdminTopbar
          title="Orders Management"
          description="Manage customer orders, track courier dispatches, and update payment settlements"
        />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Stats KPI Cards */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">Total Orders</span>
                <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">{stats.total_orders}</p>
              </div>

              <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm bg-gradient-to-br from-white to-amber-50/40">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800">Pending</span>
                <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">{stats.pending_orders}</p>
              </div>

              <div className="bg-white border border-purple-200/80 rounded-2xl p-4 shadow-sm bg-gradient-to-br from-white to-purple-50/40">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-800">In Transit</span>
                <p className="text-2xl sm:text-3xl font-black text-purple-700 mt-1">{stats.shipped_orders || 0}</p>
              </div>

              <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 shadow-sm bg-gradient-to-br from-white to-emerald-50/40">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">Delivered</span>
                <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">{stats.delivered_orders}</p>
              </div>

              <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">Total Revenue</span>
                <p className="text-xl sm:text-2xl font-black text-gray-900 mt-1 truncate">{formatCurrency(stats.total_revenue)}</p>
              </div>

              <Link
                to="/admin/returns"
                className="bg-white border border-pink-200/80 rounded-2xl p-4 hover:border-pink-400 transition-all shadow-sm bg-gradient-to-br from-white to-pink-50/40 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-pink-800">Returns</span>
                  <span className="text-xs group-hover:translate-x-0.5 transition-transform text-pink-600 font-bold">→</span>
                </div>
                <p className="text-2xl sm:text-3xl font-black text-pink-700 mt-1">{stats.return_requested_orders ?? 0}</p>
              </Link>
            </div>
          )}

          {/* Controls Bar: Tabs & Search */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none border-b border-gray-100">
              {ORDER_TABS.map((tab) => {
                const isActive = status === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleTabChange(tab.key)}
                    className={`px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-150 flex items-center gap-2 ${
                      isActive
                        ? "bg-gray-900 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Live Search & Count */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-1">
              <div className="relative w-full sm:w-96">
                <svg
                  className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by order #, customer name, email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-gray-50/50"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <p className="text-xs font-semibold text-gray-500">
                  Showing <span className="text-gray-900 font-bold">{orders.length}</span> of {total} orders
                </p>
                <button
                  type="button"
                  onClick={() => {
                    loadOrders();
                    loadStats();
                  }}
                  disabled={fetching}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors shadow-xs"
                  title="Refresh Orders"
                >
                  <svg
                    className={`w-3.5 h-3.5 ${fetching ? "animate-spin" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Orders Table (Smooth UI without unmounting) */}
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden relative">
            {fetching && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500 animate-pulse z-10" />
            )}

            {initialLoading && orders.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-500 font-medium">Fetching orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-16 text-center space-y-2">
                <div className="text-4xl">🛍️</div>
                <h3 className="text-sm font-semibold text-gray-800">No Orders Found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {debouncedSearch
                    ? `No orders match your search "${debouncedSearch}". Try clearing search filters.`
                    : status
                    ? `There are currently no orders with status "${formatStatusLabel(status)}".`
                    : "No orders have been placed in the store yet."}
                </p>
                {(status || debouncedSearch) && (
                  <button
                    onClick={() => {
                      setStatus("");
                      setSearchInput("");
                    }}
                    className="mt-3 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors"
                  >
                    View All Orders
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[1100px]">
                  <thead className="bg-gray-50/80 text-[11px] font-bold uppercase tracking-wider text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="py-4 px-5">Order #</th>
                      <th className="py-4 px-5">Customer</th>
                      <th className="py-4 px-5">Items & Amount</th>
                      <th className="py-4 px-5">Order Status</th>
                      <th className="py-4 px-5">Delivery Method & Shipping</th>
                      <th className="py-4 px-5">Payment</th>
                      <th className="py-4 px-5">Date</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((o) => {
                      const isPending = o.order_status === "pending";
                      const isConfirmed = o.order_status === "confirmed";
                      const isCancelled = o.order_status === "cancelled";
                      const isDelivered = o.order_status === "delivered" || o.shipping_status === "DELIVERED";
                      const isOutForDelivery = o.shipping_status === "OUT_FOR_DELIVERY" || o.order_status === "shipped";
                      const deliveryMethod = o.delivery_method || "COURIER";
                      const isLocal = deliveryMethod === "LOCAL";
                      const hasShipment = !!o.shipment_id;
                      const busy = actionLoadingId === o.order_id;
                      const resolvedPaymentStatus = o.payment_status === "paid" ? "success" : o.payment_status;
                      const st = orderStatusStyles[o.order_status] || orderStatusStyles.pending;

                      return (
                        <tr key={o.order_id} className="hover:bg-gray-50/60 transition-colors">
                          {/* Order # */}
                          <td className="py-4 px-5">
                            <div className="font-bold text-gray-900 text-sm">
                              #{o.order_number}
                            </div>
                            <span className="text-[10px] font-mono text-gray-400">ID: {o.order_id}</span>
                          </td>

                          {/* Customer */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-xs">
                                {getInitials(o.customer_name)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate max-w-xs">{o.customer_name || "Guest Customer"}</p>
                                <p className="text-[11px] text-gray-400 truncate max-w-xs">{o.customer_email || "—"}</p>
                                {o.city && o.pincode && (
                                  <p
                                    className="text-[10px] text-indigo-600 font-medium truncate max-w-xs mt-0.5 flex items-center gap-1"
                                    title={`${o.address_line1 || ""}${o.address_line2 ? ", " + o.address_line2 : ""}, ${o.city}, ${o.state} - ${o.pincode}`}
                                  >
                                    <span>📍</span> {o.city}, {o.state} ({o.pincode})
                                  </p>
                                )}
                                {o.customer_phone && o.customer_phone !== "—" && (
                                  <p className="text-[10px] text-gray-500">📞 {o.customer_phone}</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Items & Amount */}
                          <td className="py-4 px-5">
                            <div className="font-bold text-gray-900 text-sm">
                              {formatCurrency(o.total_amount)}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-[11px] font-medium text-gray-500">
                                {o.item_count} {Number(o.item_count) === 1 ? "item" : "items"}
                              </span>
                              {Number(o.shipping_fee) > 0 ? (
                                <span className="text-[10px] bg-gray-100 text-gray-700 font-medium px-1.5 py-0.5 rounded">
                                  +₹{Number(o.shipping_fee)} ship
                                </span>
                              ) : (
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                                  Free Ship
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Order Status */}
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${st.bg} ${st.text} ${st.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                              {st.label}
                            </span>
                          </td>

                          {/* Delivery Method & Shipping */}
                          <td className="py-4 px-5">
                            <div className="space-y-1.5">
                              {/* Method Selector & Badge */}
                              <div className="flex items-center gap-1.5">
                                <select
                                  value={deliveryMethod}
                                  disabled={busy || isCancelled || isDelivered}
                                  onChange={(e) => handleDeliveryMethodChange(o.order_id, e.target.value)}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded border outline-none cursor-pointer transition-colors ${
                                    isLocal
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                      : "bg-blue-50 text-blue-800 border-blue-200"
                                  }`}
                                  title="Change delivery method"
                                >
                                  <option value="LOCAL">🛵 LOCAL (Store)</option>
                                  <option value="COURIER">🚚 COURIER (Shiprocket)</option>
                                </select>
                              </div>

                              {o.pincode && (
                                <p className="text-[10px] text-gray-500">
                                  Dest: <span className="font-semibold text-gray-700">{o.city || "India"} ({o.pincode})</span>
                                </p>
                              )}

                              {/* Fulfillment Detail */}
                              {isLocal ? (
                                <div className="text-[11px] text-gray-600">
                                  {isDelivered ? (
                                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                      <span>✅</span> Hand Delivered
                                    </span>
                                  ) : isOutForDelivery ? (
                                    <span className="text-purple-700 font-semibold flex items-center gap-1 animate-pulse">
                                      <span>🛵</span> Out for Delivery
                                    </span>
                                  ) : (
                                    <span className="text-amber-700 font-medium flex items-center gap-1">
                                      <span>📦</span> Ready at Store
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  {!hasShipment ? (
                                    <span className="text-[11px] text-gray-400 italic">Not Dispatched</span>
                                  ) : (
                                    <div className="text-[11px] space-y-0.5">
                                      <p className="font-bold text-gray-800 flex items-center gap-1">
                                        <span>🚚</span>
                                        {formatStatusLabel(o.shipping_status) || "In Transit"}
                                      </p>
                                      {o.awb_number && (
                                        <p className="text-gray-500 font-mono text-[10px]">AWB: {o.awb_number}</p>
                                      )}
                                      {o.courier_name && (
                                        <p className="text-gray-400 text-[10px]">{o.courier_name}</p>
                                      )}
                                      <div className="flex items-center gap-1.5 pt-1">
                                        <button
                                          onClick={() => handlePrintLabel(o)}
                                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5"
                                          title="Print Official Courier Shipping Label"
                                        >
                                          <span>🖨️</span> Label
                                        </button>
                                        <button
                                          onClick={() => handlePrintInvoice(o)}
                                          className="text-[10px] font-bold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-1.5 py-0.5 rounded transition-colors flex items-center gap-0.5"
                                          title="Print Tax Invoice / Packing Slip"
                                        >
                                          <span>📄</span> Invoice
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Payment */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <select
                                value={resolvedPaymentStatus}
                                onChange={(e) => handlePaymentStatusChange(o.order_id, e.target.value)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${
                                  paymentStatusStyles[resolvedPaymentStatus] || "bg-gray-100 text-gray-700 border-gray-200"
                                }`}
                              >
                                {PAYMENT_STATUSES.map((s) => (
                                  <option key={s} value={s}>
                                    {s === "success" ? "Paid (Success)" : s[0].toUpperCase() + s.slice(1)}
                                  </option>
                                ))}
                              </select>
                              {resolvedPaymentStatus === "pending" && (
                                <button
                                  type="button"
                                  onClick={() => handleSyncPayment(o.order_id)}
                                  disabled={busy}
                                  title="Check & sync payment directly from Razorpay"
                                  className="text-[10px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                                >
                                  <span>🔄</span> Sync
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-4 px-5 text-[11px] text-gray-500 whitespace-nowrap">
                            {formatDate(o.ordered_at)}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Pending State */}
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => handleConfirm(o)}
                                    disabled={busy}
                                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors disabled:opacity-50 shadow-xs"
                                  >
                                    {busy ? "..." : "Confirm"}
                                  </button>
                                  <button
                                    onClick={() => setCancelTargetOrder(o)}
                                    disabled={busy}
                                    className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}

                              {/* LOCAL DELIVERY ACTIONS */}
                              {isLocal && !isPending && !isCancelled && !isDelivered && (
                                <>
                                  {!isOutForDelivery ? (
                                    <button
                                      onClick={() => handleLocalStatusChange(o.order_id, "out_for_delivery")}
                                      disabled={busy}
                                      className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-xs flex items-center gap-1"
                                      title="Mark order as out for local delivery"
                                    >
                                      <span>🛵</span>
                                      {busy ? "..." : "Out for Delivery"}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleLocalStatusChange(o.order_id, "delivered")}
                                      disabled={busy}
                                      className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-green-700 text-white hover:bg-green-800 transition-colors disabled:opacity-50 shadow-xs flex items-center gap-1"
                                      title="Mark order as delivered"
                                    >
                                      <span>✅</span>
                                      {busy ? "..." : "Mark Delivered"}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setCancelTargetOrder(o)}
                                    disabled={busy}
                                    className="text-xs font-bold px-2 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}

                              {/* COURIER DELIVERY ACTIONS */}
                              {!isLocal && isConfirmed && !hasShipment && (
                                <>
                                  <button
                                    onClick={() => handleScheduleCourier(o)}
                                    disabled={busy}
                                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 shadow-xs flex items-center gap-1"
                                  >
                                    <span>📦</span>
                                    {busy ? "..." : "Dispatch"}
                                  </button>
                                  <button
                                    onClick={() => setCancelTargetOrder(o)}
                                    disabled={busy}
                                    className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}

                              {!isLocal && hasShipment && !isCancelled && (
                                <>
                                  <button
                                    onClick={() => handlePrintLabel(o)}
                                    disabled={busy}
                                    className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-50 shadow-xs flex items-center gap-1"
                                    title="Print Shipping Label"
                                  >
                                    <span>🖨️</span> Label
                                  </button>
                                  <button
                                    onClick={() => handleRefreshTracking(o)}
                                    disabled={busy}
                                    className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                    title="Refresh Courier Tracking"
                                  >
                                    Track
                                  </button>
                                  <button
                                    onClick={() => setCancelShipmentTarget(o)}
                                    disabled={busy}
                                    className="text-xs font-bold px-2 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                    title="Cancel Courier Dispatch"
                                  >
                                    Cancel Ship
                                  </button>
                                </>
                              )}

                              {/* Generic Cancel for remaining states */}
                              {!isCancelled && !isDelivered && !isPending && (isLocal ? false : (!isConfirmed && !hasShipment)) && (
                                <button
                                  onClick={() => setCancelTargetOrder(o)}
                                  disabled={busy}
                                  className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-500 font-medium">
                Page <span className="font-bold text-gray-900">{page}</span> of {totalPages} ({total} total orders)
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="text-xs font-bold px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors shadow-xs"
                >
                  ← Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="text-xs font-bold px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors shadow-xs"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      <ConfirmDialog
        open={!!cancelTargetOrder}
        title="Cancel Order?"
        message={`Are you sure you want to cancel order #${cancelTargetOrder?.order_number}? This action will halt fulfillment.`}
        loading={actionLoadingId === cancelTargetOrder?.order_id}
        onConfirm={handleCancel}
        onCancel={() => setCancelTargetOrder(null)}
      />

      {/* Cancel Shipment Confirmation Modal */}
      <ConfirmDialog
        open={!!cancelShipmentTarget}
        title="Cancel Courier Shipment?"
        message={`Are you sure you want to cancel the courier shipment for order #${cancelShipmentTarget?.order_number}?`}
        loading={actionLoadingId === cancelShipmentTarget?.order_id}
        onConfirm={handleCancelShipment}
        onCancel={() => setCancelShipmentTarget(null)}
      />
    </AdminLayout>
  );
}