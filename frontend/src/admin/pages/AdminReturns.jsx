import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import toast from "react-hot-toast";
import { getReturns, updateReturnStatus } from "../../api/orderApi";
import useAdminSocket from "../../hooks/Useadminsocket";

const RETURN_STATUSES = ["pending", "approved", "rejected", "pickup_scheduled", "picked_up", "received", "refunded"];

const statusStyles = {
  pending: "bg-amber-50 text-amber-600",
  approved: "bg-sky-50 text-sky-600",
  rejected: "bg-red-50 text-red-500",
  pickup_scheduled: "bg-purple-50 text-purple-600",
  picked_up: "bg-indigo-50 text-indigo-600",
  received: "bg-blue-50 text-blue-600",
  refunded: "bg-green-50 text-green-600",
};

// Each step is its own deliberate admin action — approving a return
// does NOT automatically schedule a pickup or move money. Every step
// requires an explicit click.
const NEXT_ACTIONS = {
  pending: [
    { action: "approve", label: "Approve", className: "bg-sky-500 hover:bg-sky-600" },
    { action: "reject", label: "Reject", className: "bg-red-500 hover:bg-red-600" },
  ],
  approved: [
    { action: "schedule_pickup", label: "Schedule courier pickup", className: "bg-purple-500 hover:bg-purple-600" },
  ],
  pickup_scheduled: [
    { action: "picked_up", label: "Mark picked up", className: "bg-indigo-500 hover:bg-indigo-600" },
  ],
  picked_up: [
    { action: "received", label: "Mark received at warehouse", className: "bg-blue-500 hover:bg-blue-600" },
  ],
  received: [
    { action: "process_refund", label: "Process refund", className: "bg-green-500 hover:bg-green-600" },
  ],
  rejected: [],
  refunded: [],
};

const formatStatusLabel = (s) =>
  s.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

const formatCurrency = (value) => `₹${Number(value).toLocaleString("en-IN")}`;

const formatDate = (isoString) =>
  new Date(isoString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function AdminReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const loadReturns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReturns({ status: status || undefined, page, limit });
      setReturns(data.returns);
      setTotal(data.total);
    } catch (err) {
      toast.error("Failed to load returns.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    loadReturns();
  }, [loadReturns]);

  // Live updates from any admin session — same pattern as AdminOrders.
  useAdminSocket({
    "admin:return-updated": ({ returnId, status }) => {
      setReturns((current) =>
        current.map((r) => (r.return_id === returnId ? { ...r, status } : r))
      );
    },
  });

  const handleAction = async (returnItem, action) => {
    const confirmMessage =
      action === "process_refund"
        ? `Process a real refund via Razorpay for order #${returnItem.order_number} (${formatCurrency(returnItem.total_amount)})? This actually moves money and can't be undone.`
        : `${formatStatusLabel(action)} this return for order #${returnItem.order_number}?`;

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    try {
      await updateReturnStatus(returnItem.return_id, action);
      toast.success(
        action === "process_refund" ? "Refund processed successfully." : "Return status updated."
      );
      loadReturns();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update return status.");
      console.error(err);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <AdminLayout>
      <AdminTopbar title="Returns" subtitle="Review, approve, and process customer return requests." />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="w-full sm:w-auto border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 bg-white"
          >
            <option value="">All statuses</option>
            {RETURN_STATUSES.map((s) => <option key={s} value={s}>{formatStatusLabel(s)}</option>)}
          </select>
          <p className="text-xs text-gray-400 whitespace-nowrap">{total} return{total !== 1 ? "s" : ""}</p>
        </div>

        <div className="space-y-4">
          {loading && (
            <div className="bg-white border border-gray-100 rounded-xl p-12 text-center text-sm text-gray-400">
              Loading returns...
            </div>
          )}

          {!loading && returns.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-12 text-center text-sm text-gray-400">
              No return requests found.
            </div>
          )}

          {!loading && returns.map((r) => {
            const actions = NEXT_ACTIONS[r.status] || [];

            return (
              <div key={r.return_id} className="bg-white border border-gray-100 rounded-xl p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-bold text-gray-900">Order #{r.order_number}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[r.status]}`}>
                        {formatStatusLabel(r.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">{r.customer_name} · {r.customer_email}</p>
                    <p className="mt-3 text-sm text-gray-700"><span className="font-semibold">Reason:</span> {r.reason}</p>
                    {r.description && (
                      <p className="mt-1 text-sm text-gray-500">{r.description}</p>
                    )}
                    {r.pickup_tracking_id && (
                      <p className="mt-2 text-xs text-gray-400">Pickup tracking: {r.pickup_tracking_id}</p>
                    )}
                    {Array.isArray(r.photos) && r.photos.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        {r.photos.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer">
                            <img
                              src={url}
                              alt={`Return photo ${i + 1}`}
                              className="h-16 w-16 rounded-md border border-gray-200 object-cover hover:opacity-80"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-gray-400">
                      Order total: {formatCurrency(r.total_amount)} · Requested {formatDate(r.created_at)}
                    </p>
                  </div>

                  {actions.length > 0 && (
                    <div className="flex gap-2 flex-shrink-0">
                      {actions.map(({ action, label, className }) => (
                        <button
                          key={action}
                          onClick={() => handleAction(r, action)}
                          className={`rounded-md px-4 py-2 text-xs font-bold text-white transition-colors ${className}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

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