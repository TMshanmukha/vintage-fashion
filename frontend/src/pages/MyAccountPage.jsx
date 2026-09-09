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
  trackMyOrder,
} from "../api/myOrdersApi";
import useSocket from "../hooks/Usesocket";
import OrderProgressTracker from "../components/Orderprogresstracker";
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
  approved: "Return accepted",
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
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

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
    "order:payment-status-changed": ({ orderId, payment_status }) => {
      setOrders((current) =>
        current.map((o) => (o.order_id === orderId ? { ...o, payment_status } : o))
      );
    },
    "return:status-changed": ({ returnId, status }) => {
      setOrderDetail((current) =>
        current && current.returnRequest?.return_id === returnId
          ? { ...current, returnRequest: { ...current.returnRequest, status } }
          : current
      );
    },
    // NEW — live shipping status push, no manual refresh needed if the
    // customer already has this page open when admin acts.
    "order:shipping-updated": ({ orderId, shipping_status, awb_number, courier_name }) => {
      setOrderDetail((current) =>
        current && current.order?.order_id === orderId
          ? {
              ...current,
              order: {
                ...current.order,
                shipping_status,
                ...(awb_number && { awb_number }),
                ...(courier_name && { courier_name }),
              },
            }
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

  const handleRefreshTracking = async () => {
    if (!selectedOrder) return;
    setTrackingLoading(true);
    try {
      const res = await trackMyOrder(selectedOrder.order_id);
      setTrackingData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't load tracking info.");
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleCancelOrder = (order) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto border border-gray-100 overflow-hidden ring-1 ring-black ring-opacity-5`}
        >
          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-red-500 border border-red-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900">
                  Cancel Order Confirmation
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Are you sure you want to cancel order{" "}
                  <span className="font-semibold text-gray-800">
                    #{order.order_number || order.order_id}
                  </span>
                  ?
                </p>

                {/* Order Details Preview */}
                <div className="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Total Amount:</span>
                    <span className="font-bold text-gray-900">{formatINR(order.total_amount)}</span>
                  </div>
                  {order.ordered_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Order Date:</span>
                      <span className="text-gray-700 font-medium">
                        {new Date(order.ordered_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  {order.payment_method && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Payment:</span>
                      <span className="text-gray-700 font-medium uppercase">
                        {order.payment_method}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => toast.dismiss(t.id)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
              >
                No, Keep Order
              </button>
              <button
                type="button"
                onClick={async () => {
                  toast.dismiss(t.id);
                  try {
                    await cancelMyOrder(order.order_id);
                    setOrders((current) =>
                      current.map((o) =>
                        o.order_id === order.order_id
                          ? { ...o, order_status: "cancelled" }
                          : o
                      )
                    );
                    setSelectedOrder((prev) =>
                      prev && prev.order_id === order.order_id
                        ? { ...prev, order_status: "cancelled" }
                        : prev
                    );
                    setOrderDetail((prev) =>
                      prev && prev.order?.order_id === order.order_id
                        ? {
                            ...prev,
                            order: { ...prev.order, order_status: "cancelled" },
                          }
                        : prev
                    );
                    toast.success(
                      `Order #${order.order_number || order.order_id} has been cancelled successfully.`
                    );
                  } catch (err) {
                    console.error("Cancellation error:", err);
                    toast.error(err.response?.data?.message || "Couldn't cancel this order.");
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition shadow-sm hover:shadow"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: "top-center",
      }
    );
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
                  <article
                    key={order.order_id}
                    onClick={() => handleSelectOrder(order)}
                    className={`rounded-lg border p-5 shadow-sm cursor-pointer transition-all duration-200 ${
                      selectedOrder?.order_id === order.order_id
                        ? "border-pink-500 bg-pink-50/10 ring-1 ring-pink-500"
                        : "border-gray-100 bg-white hover:border-pink-200 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="text-left">
                        <h2 className="text-lg font-bold text-gray-900">
                          #{order.order_number || order.order_id}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Placed on {new Date(order.ordered_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[displayStatus] || statusStyles.Confirmed}`}
                        >
                          {displayStatus}
                        </span>
                        {order.payment_status === "refunded" && (
                          <span className="w-fit rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                            Refunded
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-base font-extrabold text-gray-900">
                        Order total: {formatINR(order.total_amount)}
                      </p>
                      {canCancel && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelOrder(order);
                          }}
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
                        <OrderProgressTracker
                          orderStatus={selectedOrder.order_status}
                          shippingStatus={orderDetail?.order?.shipping_status}
                        />

                        {orderDetail?.order?.awb_number ? (
                          <div className="mt-4 rounded-md border border-gray-100 p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-bold text-gray-800">
                                  AWB: {orderDetail.order.awb_number}
                                </p>
                                {orderDetail.order.courier_name && (
                                  <p className="text-xs text-gray-400">{orderDetail.order.courier_name}</p>
                                )}
                              </div>
                              <button
                                onClick={handleRefreshTracking}
                                disabled={trackingLoading}
                                className="text-xs font-bold text-pink-500 hover:underline disabled:opacity-50"
                              >
                                {trackingLoading ? "Refreshing…" : "Refresh Tracking"}
                              </button>
                            </div>

                            {trackingData?.tracking_data?.shipment_track_activities?.length > 0 && (
                              <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
                                {trackingData.tracking_data.shipment_track_activities.map((a, i) => (
                                  <div key={i} className="text-xs">
                                    <p className="font-semibold text-gray-700">{a.activity}</p>
                                    <p className="text-gray-400">{a.location} — {a.date}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="mt-3 text-center text-xs text-gray-400">
                            Shipment not created yet.
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