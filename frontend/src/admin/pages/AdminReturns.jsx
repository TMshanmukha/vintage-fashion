import { useState, useEffect, useCallback, useMemo } from "react";
import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import ConfirmDialog from "../components/ConfirmDialog";
import toast from "react-hot-toast";
import { getReturns, updateReturnStatus } from "../../api/orderApi";
import useAdminSocket from "../../hooks/Useadminsocket";

const STORE_RETURN_ADDRESS = "Vintage Fashion Flagship Store & Hub, #42 Fashion Boulevard, Indiranagar, Bengaluru, Karnataka - 560038";

const RETURN_STATUSES = [
  { key: "all", label: "All Returns" },
  { key: "pending", label: "Pending Approval" },
  { key: "approved", label: "Approved" },
  { key: "pickup_scheduled", label: "Pickup Scheduled" },
  { key: "picked_up", label: "Picked Up" },
  { key: "received", label: "Received at Warehouse" },
  { key: "refunded", label: "Refunded" },
  { key: "rejected", label: "Rejected" },
];

const statusStyles = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500", label: "Pending Approval" },
  approved: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", dot: "bg-sky-500", label: "Approved" },
  pickup_scheduled: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500", label: "Pickup Scheduled" },
  picked_up: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", dot: "bg-indigo-500", label: "In Transit (Picked Up)" },
  received: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500", label: "Received at Hub" },
  refunded: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", label: "Refunded & Settled" },
  rejected: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", label: "Rejected" },
};

const formatStatusLabel = (s) =>
  statusStyles[s]?.label || s?.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ") || "Unknown";

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (isoString) =>
  isoString
    ? new Date(isoString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

const parsePhotos = (photos) => {
  if (Array.isArray(photos)) return photos;
  if (typeof photos === "string") {
    try {
      const parsed = JSON.parse(photos);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return photos ? [photos] : [];
    }
  }
  return [];
};

const calculateReturnFinancials = (r) => {
  const totalPaid = Number(r.total_amount || 0);
  const forwardShipping = Number(r.shipping_fee || 0);
  const returnShipping = forwardShipping > 0 ? forwardShipping : 89;
  const totalShippingDeductions = forwardShipping + returnShipping;
  const calculatedRefund = Math.max(1, totalPaid - totalShippingDeductions);
  const netRefund = r.refund_amount != null ? Number(r.refund_amount) : calculatedRefund;
  const shippingDeduction = r.shipping_deduction != null ? Number(r.shipping_deduction) : totalShippingDeductions;
  const isLocal = r.delivery_method === "LOCAL" || r.return_delivery_method === "LOCAL";

  return {
    totalPaid,
    subtotal: Number(r.subtotal || 0),
    discountAmount: Number(r.discount_amount || 0),
    forwardShipping,
    returnShipping,
    totalShippingDeductions: shippingDeduction,
    netRefund,
    isLocal,
  };
};

const getNextActions = (r) => {
  const isLocal = r.delivery_method === "LOCAL" || r.return_delivery_method === "LOCAL";
  switch (r.status) {
    case "pending":
      return [
        { action: "approve", label: "Approve Return", className: "bg-sky-600 hover:bg-sky-700 text-white" },
        { action: "reject", label: "Reject", className: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200" },
      ];
    case "approved":
      return isLocal
        ? [{ action: "schedule_pickup", label: "Schedule Store Local Pickup", className: "bg-emerald-600 hover:bg-emerald-700 text-white" }]
        : [{ action: "schedule_pickup", label: "Schedule Courier Pickup", className: "bg-purple-600 hover:bg-purple-700 text-white" }];
    case "pickup_scheduled":
      return isLocal
        ? [{ action: "picked_up", label: "Mark Picked Up by Store Rider", className: "bg-indigo-600 hover:bg-indigo-700 text-white" }]
        : [{ action: "picked_up", label: "Mark Picked Up by Courier", className: "bg-indigo-600 hover:bg-indigo-700 text-white" }];
    case "picked_up":
      return [
        { action: "received", label: "Mark Received at Store Hub", className: "bg-blue-600 hover:bg-blue-700 text-white" },
      ];
    case "received": {
      const { netRefund } = calculateReturnFinancials(r);
      return [
        {
          action: "process_refund",
          label: `Process Refund (${formatCurrency(netRefund)})`,
          className: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-bold",
        },
      ];
    }
    default:
      return [];
  }
};

export default function AdminReturns() {
  const [returns, setReturns] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [actionTarget, setActionTarget] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const limit = 20;

  const loadReturns = useCallback(async (isSilent = false) => {
    if (!isSilent) setFetching(true);
    try {
      const data = await getReturns({
        status: activeTab === "all" ? undefined : activeTab,
        page,
        limit,
      });
      setReturns(Array.isArray(data?.returns) ? data.returns : []);
      setTotal(data?.total || 0);
    } catch (err) {
      toast.error("Failed to load returns.");
      console.error(err);
    } finally {
      setInitialLoading(false);
      setFetching(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    loadReturns();
  }, [loadReturns]);

  useAdminSocket({
    "admin:return-updated": ({ returnId, status: newStatus, refund_amount, shipping_deduction }) => {
      setReturns((current) =>
        current.map((r) =>
          r.return_id === returnId
            ? {
                ...r,
                status: newStatus,
                refund_amount: refund_amount !== undefined ? refund_amount : r.refund_amount,
                shipping_deduction: shipping_deduction !== undefined ? shipping_deduction : r.shipping_deduction,
              }
            : r
        )
      );
    },
  });

  const handleTabClick = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const confirmAction = async () => {
    if (!actionTarget) return;
    const { returnItem, action } = actionTarget;
    const { netRefund, totalShippingDeductions } = calculateReturnFinancials(returnItem);

    try {
      setProcessing(true);
      await updateReturnStatus(returnItem.return_id, action);
      toast.success(
        action === "process_refund"
          ? `Refund of ${formatCurrency(netRefund)} processed successfully (deducted ${formatCurrency(totalShippingDeductions)} two-way shipping)!`
          : `Return status updated to ${formatStatusLabel(action)}.`
      );
      setActionTarget(null);
      loadReturns(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update return status.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  // Filtered by search keyword
  const filteredReturns = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return returns;
    return returns.filter(
      (r) =>
        r.order_number?.toString().toLowerCase().includes(q) ||
        r.customer_name?.toLowerCase().includes(q) ||
        r.customer_email?.toLowerCase().includes(q) ||
        r.reason?.toLowerCase().includes(q) ||
        r.pickup_tracking_id?.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q) ||
        r.pincode?.toString().toLowerCase().includes(q)
    );
  }, [returns, search]);

  // Stats Summary
  const stats = useMemo(() => {
    const totalCount = returns.length;
    const pendingCount = returns.filter((r) => r.status === "pending").length;
    const inTransitCount = returns.filter((r) => ["pickup_scheduled", "picked_up", "received"].includes(r.status)).length;
    const refundedCount = returns.filter((r) => r.status === "refunded").length;
    const totalRefundValue = returns
      .filter((r) => r.status === "refunded")
      .reduce((acc, r) => acc + Number(r.refund_amount ?? calculateReturnFinancials(r).netRefund), 0);

    return { totalCount, pendingCount, inTransitCount, refundedCount, totalRefundValue };
  }, [returns]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <AdminLayout>
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        <AdminTopbar
          title="Customer Returns & Refunds"
          description="Manage doorstep reverse pickups (Customer Doorstep ➔ Store Hub) and net refunds after double-shipping deductions"
        />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Total Requests</span>
                <span className="p-2 rounded-xl bg-gray-100 text-gray-700">📦</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">{total}</p>
              <p className="text-xs text-gray-400 mt-1">Across all orders</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-sm bg-gradient-to-br from-white to-amber-50/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">Action Needed</span>
                <span className="p-2 rounded-xl bg-amber-100 text-amber-800">⏳</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-2">{stats.pendingCount}</p>
              <p className="text-xs text-amber-600 font-bold mt-1">Pending approval</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-indigo-200/80 shadow-sm bg-gradient-to-br from-white to-indigo-50/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-indigo-800 uppercase tracking-wider">In Reverse Transit</span>
                <span className="p-2 rounded-xl bg-indigo-100 text-indigo-800">🚚</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-indigo-700 mt-2">{stats.inTransitCount}</p>
              <p className="text-xs text-indigo-600 font-bold mt-1">Pickup or store transit</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200/80 shadow-sm bg-gradient-to-br from-white to-emerald-50/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Refunds Settled</span>
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">💳</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">{formatCurrency(stats.totalRefundValue)}</p>
              <p className="text-xs text-emerald-600 font-bold mt-1">{stats.refundedCount} closed refunds</p>
            </div>
          </div>

          {/* Controls Bar: Tabs & Live Search */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none border-b border-gray-100">
              {RETURN_STATUSES.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleTabClick(tab.key)}
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

            {/* Search Bar & Total */}
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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by Order #, Customer, Pincode, Tracking ID..."
                  className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-gray-50/50"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => loadReturns()}
                disabled={fetching}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors self-end sm:self-auto shadow-xs"
                title="Refresh Returns"
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

          {/* Returns Table */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden relative">
            {fetching && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-pink-500 animate-pulse z-10" />
            )}

            {initialLoading && returns.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-500 font-medium">Fetching return requests...</p>
              </div>
            ) : filteredReturns.length === 0 ? (
              <div className="p-16 text-center space-y-2">
                <div className="text-4xl">📦</div>
                <h3 className="text-sm font-semibold text-gray-800">No Return Requests Found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {search
                    ? `No returns match your search "${search}".`
                    : activeTab !== "all"
                    ? `There are currently no return requests with status "${formatStatusLabel(activeTab)}".`
                    : "There are no customer return requests in the system right now."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 text-gray-600 border-b border-gray-200 uppercase tracking-wider font-bold text-[11px]">
                    <tr>
                      <th className="py-4 px-5">Order & Pickup Route</th>
                      <th className="py-4 px-5">Customer</th>
                      <th className="py-4 px-5">Reason & Proof</th>
                      <th className="py-4 px-5">Refund Breakdown (Double Shipping Deducted)</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5 text-right">Action Workflow</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredReturns.map((r) => {
                      const st = statusStyles[r.status] || statusStyles.pending;
                      const actions = getNextActions(r);
                      const fin = calculateReturnFinancials(r);

                      return (
                        <tr key={r.return_id} className="hover:bg-gray-50/60 transition-colors">
                          {/* Order & Route */}
                          <td className="py-4 px-5 align-top max-w-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 text-sm">
                                #{r.order_number}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  fin.isLocal
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-purple-50 text-purple-700 border border-purple-200"
                                }`}
                              >
                                {fin.isLocal ? "Local Store Pickup" : "Courier Reverse Pickup"}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              Requested on {formatDate(r.created_at)}
                            </p>

                            {/* Taking Address & Return Destination */}
                            <div className="mt-2 text-[11px] space-y-1 rounded-lg bg-gray-50 p-2.5 border border-gray-100">
                              <p className="text-gray-700 font-medium leading-tight">
                                <strong className="text-gray-900 font-semibold">📍 Taking Address:</strong>{" "}
                                {[r.address_line1, r.address_line2, r.city, r.state, r.pincode].filter(Boolean).join(", ") || "Customer Address"}
                              </p>
                              <p className="text-gray-500 leading-tight">
                                <strong className="text-gray-700 font-semibold">🏬 Return Dest:</strong> {STORE_RETURN_ADDRESS}
                              </p>
                            </div>

                            {r.pickup_tracking_id && (
                              <div className="mt-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-[10px] font-mono font-bold border border-purple-100">
                                  🚚 {r.pickup_tracking_id}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Customer */}
                          <td className="py-4 px-5 align-top">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-sm">
                                {(r.customer_name || "C").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{r.customer_name || "Customer"}</p>
                                <p className="text-[11px] text-gray-500 truncate max-w-[150px]" title={r.customer_email}>
                                  {r.customer_email || "—"}
                                </p>
                                {r.customer_phone && r.customer_phone !== "—" && (
                                  <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                                    📞 {r.customer_phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Reason & Photos */}
                          <td className="py-4 px-5 align-top max-w-xs">
                            <span className="inline-block px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-800 font-semibold text-[11px] border border-gray-200">
                              {r.reason}
                            </span>
                            {r.description && (
                              <p className="text-gray-600 mt-1.5 leading-relaxed line-clamp-2 text-[11px]">
                                {r.description}
                              </p>
                            )}
                            {(() => {
                              const returnPhotos = parsePhotos(r.photos);
                              return returnPhotos.length > 0 ? (
                                <div className="mt-2 flex gap-1.5 items-center flex-wrap">
                                  {returnPhotos.map((url, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => setPreviewImage(url)}
                                      className="relative group rounded-lg overflow-hidden border border-gray-200 w-10 h-10 flex-shrink-0 cursor-pointer"
                                      title="View proof photo"
                                    >
                                      <img
                                        src={url}
                                        alt={`Proof ${idx + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      />
                                    </button>
                                  ))}
                                  <span className="text-[10px] text-gray-400 font-medium">({returnPhotos.length} photo{returnPhotos.length > 1 ? "s" : ""})</span>
                                </div>
                              ) : null;
                            })()}
                          </td>

                          {/* Refund Breakdown (Double Shipping Deducted) */}
                          <td className="py-4 px-5 align-top">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] text-gray-500">
                                <span>Total Paid:</span>
                                <span className="font-semibold text-gray-700">{formatCurrency(fin.totalPaid)}</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-rose-600">
                                <span>Forward Freight:</span>
                                <span>- {formatCurrency(fin.forwardShipping)}</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-rose-600">
                                <span>Return Pickup Fee:</span>
                                <span>- {formatCurrency(fin.returnShipping)}</span>
                              </div>
                              <div className="pt-1 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-xs font-extrabold text-gray-900">Net Refund:</span>
                                <span className="text-sm font-extrabold text-emerald-700">
                                  {formatCurrency(fin.netRefund)}
                                </span>
                              </div>
                              <span className="inline-block mt-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                2-way shipping deducted
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-5 align-top">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${st.bg} ${st.text} ${st.border}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                              {st.label}
                            </span>
                          </td>

                          {/* Action Workflow */}
                          <td className="py-4 px-5 align-top text-right">
                            {actions.length > 0 ? (
                              <div className="flex items-center justify-end gap-2 flex-wrap">
                                {actions.map(({ action, label, className }) => (
                                  <button
                                    key={action}
                                    onClick={() => setActionTarget({ returnItem: r, action, label })}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${className}`}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-gray-400 italic">No pending actions</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                <p className="text-xs text-gray-500">
                  Page <span className="font-semibold text-gray-900">{page}</span> of <span className="font-semibold text-gray-900">{totalPages}</span> ({total} total)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40 transition-colors shadow-xs"
                  >
                    ← Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40 transition-colors shadow-xs"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {actionTarget && (
        <ConfirmDialog
          open={Boolean(actionTarget)}
          title={actionTarget?.action === "process_refund" ? "Confirm Instant Net Refund" : `${actionTarget?.label}?`}
          message={
            actionTarget?.action === "process_refund" ? (
              <div className="text-left space-y-3 text-xs">
                <p className="text-gray-600">
                  You are processing a refund for <strong>Order #{actionTarget.returnItem.order_number}</strong> ({actionTarget.returnItem.customer_name}).
                </p>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5 font-medium">
                  <div className="flex justify-between text-gray-600">
                    <span>Original Payment:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(actionTarget.returnItem.total_amount)}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>Less Forward Freight:</span>
                    <span>- {formatCurrency(actionTarget.returnItem.shipping_fee || 0)}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>Less Return Logistics Fee:</span>
                    <span>- {formatCurrency((actionTarget.returnItem.shipping_fee || 0) > 0 ? actionTarget.returnItem.shipping_fee : 89)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-extrabold text-emerald-700">
                    <span>Net Refund to Customer:</span>
                    <span>{formatCurrency(calculateReturnFinancials(actionTarget.returnItem).netRefund)}</span>
                  </div>
                </div>
                <p className="text-gray-500 text-[11px]">
                  This will initiate an instant net refund of{" "}
                  <strong className="text-emerald-700">{formatCurrency(calculateReturnFinancials(actionTarget.returnItem).netRefund)}</strong> to the customer's original payment method via Razorpay and restock returned items into inventory.
                </p>
              </div>
            ) : actionTarget?.action === "schedule_pickup" ? (
              <div className="text-left space-y-2 text-xs">
                <p className="text-gray-600">
                  Confirm scheduling reverse pickup for <strong>Order #{actionTarget.returnItem.order_number}</strong>?
                </p>
                <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 space-y-1 text-[11px]">
                  <p><strong>📍 Taking Address:</strong> {[actionTarget.returnItem.address_line1, actionTarget.returnItem.city, actionTarget.returnItem.pincode].filter(Boolean).join(", ")}</p>
                  <p><strong>🏬 Return Dest:</strong> {STORE_RETURN_ADDRESS}</p>
                  <p><strong>🚚 Pickup Method:</strong> {actionTarget.returnItem.delivery_method === "LOCAL" ? "Local Store Rider" : "Shiprocket Courier Reverse Pickup"}</p>
                </div>
              </div>
            ) : (
              `Are you sure you want to ${actionTarget?.label?.toLowerCase()} for Order #${actionTarget?.returnItem?.order_number} (${actionTarget?.returnItem?.customer_name})?`
            )
          }
          confirmText={actionTarget?.action === "process_refund" ? "Confirm & Process Refund" : "Confirm"}
          confirmColor={actionTarget?.action === "reject" ? "bg-red-600 hover:bg-red-700" : "bg-gray-900 hover:bg-gray-800"}
          onConfirm={confirmAction}
          onCancel={() => setActionTarget(null)}
          loading={processing}
        />
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-white rounded-2xl overflow-hidden p-2 shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center text-sm font-bold z-10 hover:bg-black"
            >
              ✕
            </button>
            <img src={previewImage} alt="Return Proof Preview" className="w-full h-auto max-h-[80vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}