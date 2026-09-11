import { useState, useEffect, useCallback, useMemo } from "react";
import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import ConfirmDialog from "../components/ConfirmDialog";
import toast from "react-hot-toast";
import { getReturns, updateReturnStatus } from "../../api/orderApi";
import useAdminSocket from "../../hooks/Useadminsocket";

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
  refunded: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", label: "Refunded & Closed" },
  rejected: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", label: "Rejected" },
};

const NEXT_ACTIONS = {
  pending: [
    { action: "approve", label: "Approve Return", className: "bg-sky-600 hover:bg-sky-700 text-white" },
    { action: "reject", label: "Reject", className: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200" },
  ],
  approved: [
    { action: "schedule_pickup", label: "Schedule Courier Pickup", className: "bg-purple-600 hover:bg-purple-700 text-white" },
  ],
  pickup_scheduled: [
    { action: "picked_up", label: "Mark Picked Up", className: "bg-indigo-600 hover:bg-indigo-700 text-white" },
  ],
  picked_up: [
    { action: "received", label: "Mark Received at Hub", className: "bg-blue-600 hover:bg-blue-700 text-white" },
  ],
  received: [
    { action: "process_refund", label: "Process Refund via Razorpay", className: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" },
  ],
  rejected: [],
  refunded: [],
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
    "admin:return-updated": ({ returnId, status: newStatus }) => {
      setReturns((current) =>
        current.map((r) => (r.return_id === returnId ? { ...r, status: newStatus } : r))
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

    try {
      setProcessing(true);
      await updateReturnStatus(returnItem.return_id, action);
      toast.success(
        action === "process_refund"
          ? `Refund of ${formatCurrency(returnItem.total_amount)} processed successfully!`
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
        r.pickup_tracking_id?.toLowerCase().includes(q)
    );
  }, [returns, search]);

  // Stats Summary
  const stats = useMemo(() => {
    const totalCount = returns.length;
    const pendingCount = returns.filter((r) => r.status === "pending").length;
    const inTransitCount = returns.filter((r) => ["pickup_scheduled", "picked_up", "received"].includes(r.status)).length;
    const refundedCount = returns.filter((r) => r.status === "refunded").length;
    const totalRefundValue = returns.filter((r) => r.status === "refunded").reduce((acc, r) => acc + Number(r.total_amount || 0), 0);

    return { totalCount, pendingCount, inTransitCount, refundedCount, totalRefundValue };
  }, [returns]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <AdminLayout>
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        <AdminTopbar
          title="Customer Returns & Refunds"
          description="Moderate return requests, arrange doorstep pickups, and process instant customer refunds"
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
              <p className="text-xs text-gray-400 mt-1">Across all order timelines</p>
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
                <span className="text-xs font-extrabold text-indigo-800 uppercase tracking-wider">In Transit</span>
                <span className="p-2 rounded-xl bg-indigo-100 text-indigo-800">🚚</span>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-indigo-700 mt-2">{stats.inTransitCount}</p>
              <p className="text-xs text-indigo-600 font-bold mt-1">Pickup or hub transit</p>
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
                  placeholder="Search by Order #, Customer, Email, Tracking ID..."
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
                <p className="text-xs text-gray-500 font-medium">Fetching returns...</p>
              </div>
            ) : filteredReturns.length === 0 ? (
              <div className="p-16 text-center space-y-2">
                <div className="text-4xl">📦</div>
                <h3 className="text-sm font-semibold text-gray-800">No Return Requests Found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {search
                    ? `No returns match your search "${search}". Try clearing search filters.`
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
                      <th className="py-4 px-5">Order & Date</th>
                      <th className="py-4 px-5">Customer</th>
                      <th className="py-4 px-5">Reason & Details</th>
                      <th className="py-4 px-5">Refund Amount</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5 text-right">Action Workflow</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredReturns.map((r) => {
                      const st = statusStyles[r.status] || statusStyles.pending;
                      const actions = NEXT_ACTIONS[r.status] || [];

                      return (
                        <tr key={r.return_id} className="hover:bg-gray-50/60 transition-colors">
                          {/* Order & Date */}
                          <td className="py-4 px-5 align-top">
                            <div className="font-bold text-gray-900 text-sm">
                              #{r.order_number}
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {formatDate(r.created_at)}
                            </p>
                            {r.pickup_tracking_id && (
                              <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-mono font-medium border border-purple-100">
                                🚚 {r.pickup_tracking_id}
                              </span>
                            )}
                          </td>

                          {/* Customer */}
                          <td className="py-4 px-5 align-top">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-gray-900 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 shadow-sm">
                                {(r.customer_name || "C").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{r.customer_name || "Customer"}</p>
                                <p className="text-[10px] text-gray-400 truncate max-w-[150px]" title={r.customer_email}>
                                  {r.customer_email || "—"}
                                </p>
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

                          {/* Refund Amount */}
                          <td className="py-4 px-5 align-top">
                            <span className="text-sm font-bold text-gray-900">
                              {formatCurrency(r.total_amount)}
                            </span>
                            <p className="text-[10px] text-gray-400 mt-0.5">Prepaid / Original method</p>
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
                              <span className="text-[11px] text-gray-400 italic">No actions pending</span>
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
      <ConfirmDialog
        open={Boolean(actionTarget)}
        title={`${actionTarget?.label}?`}
        message={
          actionTarget?.action === "process_refund"
            ? `Process an instant real refund of ${formatCurrency(actionTarget?.returnItem?.total_amount)} via Razorpay for Order #${actionTarget?.returnItem?.order_number}? This will initiate the bank refund to the customer.`
            : `Are you sure you want to ${actionTarget?.label?.toLowerCase()} for Order #${actionTarget?.returnItem?.order_number} (${actionTarget?.returnItem?.customer_name})?`
        }
        confirmText={actionTarget?.action === "process_refund" ? "Process Refund" : "Confirm"}
        confirmColor={actionTarget?.action === "reject" ? "bg-red-600 hover:bg-red-700" : "bg-gray-900 hover:bg-gray-800"}
        onConfirm={confirmAction}
        onCancel={() => setActionTarget(null)}
        loading={processing}
      />

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