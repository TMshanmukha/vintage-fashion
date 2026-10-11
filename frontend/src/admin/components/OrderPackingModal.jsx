import { useState, useEffect, useMemo } from "react";
import { getOrderById } from "../../api/orderApi";

export default function OrderPackingModal({
  open,
  orderId,
  onClose,
  onScheduleCourier,
  onConfirmOrder,
  onLocalStatusChange,
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    if (!open || !orderId) {
      setData(null);
      setCheckedItems({});
      return;
    }

    let isMounted = true;
    setLoading(true);

    getOrderById(orderId)
      .then((res) => {
        if (!isMounted) return;
        setData(res);
        // Initialize all items as unchecked
        const initialChecks = {};
        (res.items || []).forEach((item) => {
          initialChecks[item.order_item_id] = false;
        });
        setCheckedItems(initialChecks);
      })
      .catch((err) => {
        console.error("Failed to load order packing details:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, orderId]);

  const toggleItemCheck = (itemId) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const items = data?.items || [];
  const order = data?.order;
  const payment = data?.payment;

  const totalPacked = useMemo(() => {
    return items.filter((it) => checkedItems[it.order_item_id]).length;
  }, [items, checkedItems]);

  const allPacked = items.length > 0 && totalPacked === items.length;

  const handleToggleAll = () => {
    const nextState = !allPacked;
    const updated = {};
    items.forEach((it) => {
      updated[it.order_item_id] = nextState;
    });
    setCheckedItems(updated);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  if (!open) return null;

  const cleanPhone = order?.customer_phone ? order.customer_phone.replace(/[^0-9]/g, "") : "";
  const whatsappPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shadow-inner">
              📦
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold tracking-tight">
                  Order #{order?.order_number || orderId}
                </h2>
                {order && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/20 text-white font-semibold tracking-wider">
                    {order.order_status}
                  </span>
                )}
                {order?.payment_status && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      order.payment_status === "paid" || order.payment_status === "success"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                        : order.payment_status === "refunded"
                        ? "bg-gray-500/30 text-gray-300 border border-gray-400/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                    }`}
                  >
                    Payment: {order.payment_status.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                Packing & Warehouse Fulfillment Checklist
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintSlip}
              title="Print Packing Slip"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>🖨️</span>
              <span className="hidden sm:inline">Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center text-base transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 bg-gray-50/50">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-500 font-medium">Loading items to pack...</p>
            </div>
          ) : !order ? (
            <div className="py-16 text-center text-gray-500 text-sm">
              Failed to load order details. Please try again.
            </div>
          ) : (
            <>
              {/* Customer & Shipping Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Details */}
                <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-[11px] font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                      <span>👤</span> Customer Details
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">
                      User ID: {order.user_id}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {order.customer_name || "Guest Customer"}
                    </p>
                    <p className="text-xs text-gray-500">{order.customer_email || "No email"}</p>
                    {order.customer_phone && order.customer_phone !== "—" && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
                        <span className="text-xs font-semibold text-gray-800">
                          📞 {order.customer_phone}
                        </span>
                        {whatsappPhone && (
                          <a
                            href={`https://wa.me/${whatsappPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                          >
                            <span>💬</span> WhatsApp
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-[11px] font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                      <span>📍</span> Delivery Destination
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.delivery_method === "LOCAL"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-blue-50 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {order.delivery_method === "LOCAL" ? "🛵 Local Delivery" : "🚚 Courier (Shiprocket)"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-700 space-y-0.5">
                    <p className="font-medium">
                      {order.address_line1 || "Street address not provided"}
                    </p>
                    {order.address_line2 && (
                      <p className="text-gray-500">{order.address_line2}</p>
                    )}
                    <p className="font-semibold text-gray-900 pt-1">
                      {order.city ? `${order.city}, ` : ""}{order.state ? `${order.state} ` : ""}
                      {order.pincode ? `(${order.pincode})` : ""}
                    </p>
                    {order.country && (
                      <p className="text-[11px] text-gray-400 uppercase">{order.country}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items to Pack Header with Checklist Status */}
              <div className="bg-white rounded-xl border border-gray-200/80 shadow-2xs overflow-hidden">
                <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                      <span>📦</span> Items to Pack & Verify ({items.length} {items.length === 1 ? "Item" : "Items"})
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Check each item as you physically inspect and place it into the packaging box
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-900">
                        {totalPacked} / {items.length} Packed
                      </span>
                      <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            allPacked ? "bg-emerald-500" : "bg-purple-600"
                          }`}
                          style={{
                            width: items.length > 0 ? `${(totalPacked / items.length) * 100}%` : "0%",
                          }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleAll}
                      className="px-2.5 py-1 text-[11px] font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg shadow-2xs transition-colors"
                    >
                      {allPacked ? "Uncheck All" : "Check All"}
                    </button>
                  </div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-gray-100">
                  {items.map((item, idx) => {
                    const isChecked = !!checkedItems[item.order_item_id];
                    return (
                      <div
                        key={item.order_item_id || idx}
                        onClick={() => toggleItemCheck(item.order_item_id)}
                        className={`p-4 transition-colors cursor-pointer flex items-center gap-4 ${
                          isChecked
                            ? "bg-emerald-50/40 hover:bg-emerald-50/70"
                            : "hover:bg-gray-50/70"
                        }`}
                      >
                        {/* Interactive Checkbox */}
                        <div className="shrink-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleItemCheck(item.order_item_id)}
                            className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                          />
                        </div>

                        {/* Product Thumbnail */}
                        <div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="text-xl">👗</span>
                          )}
                        </div>

                        {/* Product Information */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              className={`text-sm font-bold truncate ${
                                isChecked ? "text-gray-500 line-through" : "text-gray-900"
                              }`}
                            >
                              {item.product_name}
                            </h4>
                            <span className="text-xs font-bold text-gray-900 shrink-0">
                              ₹{Number(item.total_price || item.unit_price * item.quantity).toLocaleString("en-IN")}
                            </span>
                          </div>

                          {/* Size & Color & SKU Badges */}
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            {/* Quantity Badge */}
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-extrabold text-[11px] shadow-2xs border border-purple-200">
                              QTY: {item.quantity} {item.quantity === 1 ? "Pc" : "Pcs"}
                            </span>

                            {/* Size Badge */}
                            {item.size && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 font-bold text-[11px] border border-gray-200">
                                Size: {item.size}
                              </span>
                            )}

                            {/* Color Badge */}
                            {item.color && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 font-bold text-[11px] border border-gray-200">
                                <span className="w-2 h-2 rounded-full bg-gray-600 inline-block" />
                                {item.color}
                              </span>
                            )}

                            {/* SKU */}
                            {item.sku_variant && (
                              <span className="font-mono text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                                SKU: {item.sku_variant}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Packed Check Status Indicator */}
                        <div className="shrink-0 hidden sm:block">
                          {isChecked ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                              <span>✓</span> Packed
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-gray-400">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {allPacked && (
                  <div className="p-3 bg-emerald-50 border-t border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-2">
                    <span>🎉</span> All {items.length} items have been checked and packed into the box!
                  </div>
                )}
              </div>

              {/* Order Financial Totals */}
              <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-xs text-gray-500 space-y-0.5">
                  <p>
                    <span className="font-medium text-gray-700">Payment Gateway:</span>{" "}
                    {payment?.payment_gateway || "Razorpay"}
                  </p>
                  {payment?.transaction_id && (
                    <p className="font-mono text-[11px]">
                      Txn ID: {payment.transaction_id}
                    </p>
                  )}
                  {order.ordered_at && (
                    <p>
                      Placed on: {new Date(order.ordered_at).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>

                <div className="w-full sm:w-64 space-y-1 text-xs text-gray-600 border-t sm:border-t-0 sm:border-l sm:pl-4 border-gray-100">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-gray-800">
                      ₹{Number(order.subtotal || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  {Number(order.discount_amount) > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span>-₹{Number(order.discount_amount).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping Fee:</span>
                    <span className="font-semibold text-gray-800">
                      {Number(order.shipping_fee) > 0
                        ? `₹${Number(order.shipping_fee).toLocaleString("en-IN")}`
                        : "FREE"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-1.5 border-t border-gray-200">
                    <span>Total Amount:</span>
                    <span>₹{Number(order.total_amount || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer / Quick Actions */}
        <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold transition shadow-2xs"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {order?.order_status === "pending" && onConfirmOrder && (
              <button
                type="button"
                onClick={() => {
                  onConfirmOrder(order);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition shadow-xs"
              >
                Confirm Order
              </button>
            )}

            {order?.order_status === "confirmed" && !order.shipment_id && order.delivery_method !== "LOCAL" && onScheduleCourier && (
              <button
                type="button"
                onClick={() => {
                  onScheduleCourier(order);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <span>📦</span> Dispatch with Courier
              </button>
            )}

            {order?.delivery_method === "LOCAL" && order?.order_status === "confirmed" && onLocalStatusChange && (
              <button
                type="button"
                onClick={() => {
                  onLocalStatusChange(order.order_id, "out_for_delivery");
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <span>🛵</span> Mark Out for Delivery
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
