import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import { logout } from "../api/auth.api";
import {
  getMyOrders,
  getMyOrderDetail,
  cancelMyOrder,
  requestReturn,
} from "../api/myOrdersApi";
import useSocket from "../hooks/useSocket";
import OrderProgressTracker from "../components/OrderProgressTracker";
import OrderMapTracker from "../components/OrderMapTracker";

// Admin's real internal status vs. what the customer actually sees.
// Admin defaults new orders to "pending" (nothing packed/shipped yet),
// but from the customer's side, once they've paid, their order IS
// confirmed — so "pending" reads as "Confirmed" here. Edit this object
// alone if you want different wording; nothing else needs to change.
const CUSTOMER_STATUS_LABELS = {
  pending: "Confirmed",
  confirmed: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusStyles = {
  Confirmed: "bg-sky-50 text-sky-700 border-sky-200",
  Processing: "bg-amber-50 text-amber-700 border-amber-200",
  Packed: "bg-purple-50 text-purple-700 border-purple-200",
  Shipped: "bg-blue-50 text-blue-700 border-blue-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-gray-100 text-gray-600 border-gray-200",
};

const RETURN_STATUS_LABELS = {
  pending: "Return requested — awaiting review",
  approved: "Return approved",
  rejected: "Return rejected",
  pickup_scheduled: "Pickup scheduled",
  picked_up: "Picked up by courier",
  received: "Received at warehouse",
  refunded: "Refunded",
};

const RETURN_REASONS = [
  "Wrong size",
  "Item damaged/defective",
  "Not as described",
  "Changed my mind",
  "Other",
];

const CANCELLABLE = ["pending", "confirmed", "packed"];
const RETURNABLE = ["delivered"];

const toCustomerLabel = (status) => CUSTOMER_STATUS_LABELS[status] || "Confirmed";

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);

export default function MyAccountPage() {
  const navigate = useNavigate();
  const { user, logoutLocal } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [returnFormOpen, setReturnFormOpen] = useState(false);
  const [returnForm, setReturnForm] = useState({ reason: "", description: "" });
  const [returnPhotos, setReturnPhotos] = useState([]);
  const [submittingReturn, setSubmittingReturn] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadOrders() {
      try {
        setLoading(true);
        const response = await getMyOrders({ limit: 50 });
        const { orders: fetched } = response;
        if (!cancelled) setOrders(fetched || []);
      } catch (err) {
        console.error(err);
        toast.error("Couldn't load your orders.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Live updates — when admin changes a status (or a return status
  // changes), reflect it instantly without the customer refreshing.
  useSocket({
    "order:status-changed": ({ orderId, order_status }) => {
      setOrders((current) =>
        current.map((o) => (o.order_id === orderId ? { ...o, order_status } : o))
      );
      setSelectedOrder((current) =>
        current && current.order_id === orderId ? { ...current, order_status } : current
      );
      setOrderDetail((current) =>
        current && current.order?.order_id === orderId
          ? { ...current, order: { ...current.order, order_status } }
          : current
      );
    },
    "return:status-changed": ({ returnId, status }) => {
      setOrderDetail((current) =>
        current && current.returnRequest?.return_id === returnId
          ? { ...current, returnRequest: { ...current.returnRequest, status } }
          : current
      );
    },
  });

  const totalSpent = useMemo(() => {
    return orders
      .filter((order) => order.order_status !== "cancelled")
      .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  }, [orders]);

  const returnableCount = useMemo(
    () => orders.filter((order) => RETURNABLE.includes(order.order_status)).length,
    [orders]
  );

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleLogout = async () => {
    try {
      await logout();
      logoutLocal();
      navigate("/auth", { replace: true });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectOrder = async (order) => {
    setSelectedOrder(order);
    setOrderDetail(null);
    setReturnFormOpen(false);
    setDetailLoading(true);
    try {
      const detail = await getMyOrderDetail(order.order_id);
      setOrderDetail(detail);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't load order details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCancelOrder = async (order) => {
    const confirmed = window.confirm(
      `Do you want to cancel order #${order.order_number || order.order_id}?`
    );
    if (!confirmed) return;

    try {
      await cancelMyOrder(order.order_id);
      setOrders((current) =>
        current.map((o) =>
          o.order_id === order.order_id ? { ...o, order_status: "cancelled" } : o
        )
      );
      setSelectedOrder(null);
      setOrderDetail(null);
      setMessage(`Order #${order.order_number || order.order_id} has been cancelled.`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Couldn't cancel this order.");
    }
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();

    if (!returnForm.reason) {
      toast.error("Please select a reason for the return.");
      return;
    }

    setSubmittingReturn(true);
    try {
      await requestReturn(selectedOrder.order_id, {
        reason: returnForm.reason,
        description: returnForm.description,
        photos: returnPhotos,
      });

      setMessage(
        `Return requested for order #${selectedOrder.order_number || selectedOrder.order_id}. We'll review it shortly.`
      );
      setReturnFormOpen(false);
      setReturnForm({ reason: "", description: "" });
      setReturnPhotos([]);

      const detail = await getMyOrderDetail(selectedOrder.order_id);
      setOrderDetail(detail);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Couldn't request a return.");
    } finally {
      setSubmittingReturn(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-pink-500">My account</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Orders and returns</h1>
            <p className="mt-2 text-sm text-gray-500">
              Welcome {user?.name || "back"}. Track orders, cancel eligible orders, and request returns.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-pink-300 hover:text-pink-500"
          >
            Logout
          </button>
        </div>

        {message && (
          <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total amount spent</p>
            <p className="mt-2 text-3xl font-extrabold text-gray-900">{formatINR(totalSpent)}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total orders</p>
            <p className="mt-2 text-3xl font-extrabold text-gray-900">{orders.length}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Return available</p>
            <p className="mt-2 text-3xl font-extrabold text-gray-900">{returnableCount}</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-28 rounded-lg bg-white border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-gray-100 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">No orders yet</h2>
            <p className="mt-2 text-sm text-gray-500">When you place an order, it'll show up here.</p>
            <Link to="/shop" className="mt-4 inline-block text-sm font-bold text-pink-500">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <div className="space-y-5">
              {orders.map((order) => {
                const displayStatus = toCustomerLabel(order.order_status);
                const canCancel = CANCELLABLE.includes(order.order_status);

                return (
                  <article key={order.order_id} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <button type="button" onClick={() => handleSelectOrder(order)} className="text-left">
                        <h2 className="text-lg font-bold text-gray-900">
                          #{order.order_number || order.order_id}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Placed on {new Date(order.ordered_at).toLocaleDateString()}
                        </p>
                      </button>
                      <span
                        className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[displayStatus] || statusStyles.Confirmed}`}
                      >
                        {displayStatus}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-base font-extrabold text-gray-900">
                        Order total: {formatINR(order.total_amount)}
                      </p>
                      {canCancel && (
                        <button
                          onClick={() => handleCancelOrder(order)}
                          className="rounded-md border border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
                        >
                          Cancel order
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:h-fit">
              {!selectedOrder ? (
                <div className="py-10 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pink-50 text-pink-500">
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Select an order</h2>
                  <p className="mt-2 text-sm text-gray-500">Click an order to track it, cancel, or request a return.</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        #{selectedOrder.order_number || selectedOrder.order_id}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Status: {toCustomerLabel(selectedOrder.order_status)}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedOrder(null);
                        setOrderDetail(null);
                        setReturnFormOpen(false);
                      }}
                      className="text-gray-400 transition hover:text-pink-500"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {detailLoading ? (
                    <div className="space-y-3">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-24 rounded-lg bg-gray-100 animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <OrderProgressTracker orderStatus={selectedOrder.order_status} />
                        {orderDetail?.order?.tracking_id && (
                          <p className="mt-3 text-center text-xs text-gray-400">
                            Tracking ID: {orderDetail.order.tracking_id}
                            {orderDetail.order.courier_partner ? ` · ${orderDetail.order.courier_partner}` : ""}
                          </p>
                        )}
                      </div>

                      {orderDetail?.order && selectedOrder.order_status !== "pending" && (
                        <div className="mb-6">
                          <OrderMapTracker order={orderDetail.order} />
                        </div>
                      )}

                      <div className="space-y-4">
                        {(orderDetail?.items || []).map((item) => (
                          <div key={item.order_item_id} className="overflow-hidden rounded-lg border border-gray-100">
                            {item.variant_image && (
                              <img
                                src={item.variant_image}
                                alt={item.product_name}
                                className="aspect-[4/3] w-full object-cover"
                              />
                            )}
                            <div className="p-3">
                              <p className="font-bold text-gray-900">{item.product_name}</p>
                              <p className="mt-1 text-xs text-gray-400">
                                {[item.size, item.color].filter(Boolean).join(" · ")}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {item.quantity} × {formatINR(item.unit_price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 space-y-3">
                        {CANCELLABLE.includes(selectedOrder.order_status) && (
                          <button
                            onClick={() => handleCancelOrder(selectedOrder)}
                            className="w-full rounded-md bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-600"
                          >
                            Cancel this order
                          </button>
                        )}

                        {/* Return section */}
                        {orderDetail?.returnRequest ? (
                          <div className="rounded-md border border-pink-200 bg-pink-50 px-4 py-3 text-sm font-semibold text-pink-600">
                            {RETURN_STATUS_LABELS[orderDetail.returnRequest.status] || "Return in progress"}
                          </div>
                        ) : RETURNABLE.includes(selectedOrder.order_status) && !returnFormOpen ? (
                          <button
                            onClick={() => setReturnFormOpen(true)}
                            className="w-full rounded-md bg-pink-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-pink-600"
                          >
                            Request return
                          </button>
                        ) : RETURNABLE.includes(selectedOrder.order_status) && returnFormOpen ? (
                          <form onSubmit={handleSubmitReturn} className="space-y-3 rounded-md border border-gray-200 p-4">
                            <div>
                              <label className="mb-1 block text-xs font-bold text-gray-700">Reason *</label>
                              <select
                                value={returnForm.reason}
                                onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                                required
                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-pink-500"
                              >
                                <option value="">Select a reason</option>
                                {RETURN_REASONS.map((r) => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-bold text-gray-700">Description (optional)</label>
                              <textarea
                                value={returnForm.description}
                                onChange={(e) => setReturnForm({ ...returnForm, description: e.target.value })}
                                rows={3}
                                className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-pink-500"
                                placeholder="Tell us more about the issue..."
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-bold text-gray-700">Photos (optional, up to 4)</label>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => setReturnPhotos(Array.from(e.target.files).slice(0, 4))}
                                className="w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-pink-50 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-pink-600"
                              />
                              {returnPhotos.length > 0 && (
                                <p className="mt-1 text-xs text-gray-400">{returnPhotos.length} photo{returnPhotos.length !== 1 ? "s" : ""} selected</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setReturnFormOpen(false)}
                                className="flex-1 rounded-md border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:border-gray-400"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={submittingReturn}
                                className="flex-1 rounded-md bg-pink-500 px-4 py-2 text-sm font-bold text-white hover:bg-pink-600 disabled:opacity-60"
                              >
                                {submittingReturn ? "Submitting..." : "Submit request"}
                              </button>
                            </div>
                          </form>
                        ) : null}
                      </div>
                    </>
                  )}
                </>
              )}
            </aside>
          </div>
        )}

        <Link to="/shop" className="mt-8 inline-block text-sm font-bold text-pink-500">
          Continue shopping
        </Link>
      </section>
    </main>
  );
}