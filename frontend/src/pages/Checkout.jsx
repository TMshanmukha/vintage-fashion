import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../hooks/useCart";
import useAuth from "../hooks/useAuth";
import { getAddresses, addAddress } from "../api/addressApi";
import { getSettings } from "../api/settingsApi";
import { initiateCheckout, verifyPayment } from "../api/checkoutApi";
import { calculateShippingRate } from "../api/shippingApi";
import { loadRazorpayScript } from "../utils/loadRazorpay";

export default function Checkout() {
  const { cartItems, cartTotal, clearCart, cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  // Shipping calculation state
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [shippingError, setShippingError] = useState(null);

  const [form, setForm] = useState({
    label: "Home",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    is_default: false,
  });

  // Checkout requires an account — bounce guests to login and bring them
  // straight back here once they're signed in.
  useEffect(() => {
    if (!user) {
      toast.error("Please log in to checkout.");
      navigate("/auth?redirect=/checkout", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const [addrRes, settingsRes] = await Promise.all([getAddresses(), getSettings()]);
        const fetchedAddresses = addrRes.data || [];

        setAddresses(fetchedAddresses);
        setAnnouncementText(settingsRes.data?.announcement_text || "");

        const defaultAddr = fetchedAddresses.find((a) => a.is_default) || fetchedAddresses[0];

        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.address_id);
        } else {
          setShowNewAddressForm(true);
        }
      } catch (err) {
        console.error("Failed to load checkout data:", err);
        toast.error("Couldn't load your saved addresses. Please try again.");
      }

      setPageLoading(false);
    })();
  }, [user]);

  // Recalculate shipping whenever selectedAddressId or cartItems changes
  const fetchShippingRate = useCallback(async (addressId) => {
    if (!addressId || cartItems.length === 0) {
      setShippingInfo(null);
      setShippingError(null);
      return;
    }

    setShippingLoading(true);
    setShippingError(null);

    try {
      const res = await calculateShippingRate({ address_id: addressId });
      if (res.data?.success && res.data?.data) {
        setShippingInfo(res.data.data);
        setShippingError(null);
      } else {
        throw new Error(res.data?.message || "Shipping calculation failed.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Delivery is unavailable for this address.";
      setShippingError(msg);
      setShippingInfo(null);
    } finally {
      setShippingLoading(false);
    }
  }, [cartItems.length]);

  useEffect(() => {
    if (selectedAddressId) {
      fetchShippingRate(selectedAddressId);
    }
  }, [selectedAddressId, fetchShippingRate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);

    try {
      const res = await addAddress(form);
      const newAddress = res.data;
      setAddresses((prev) => [newAddress, ...prev]);
      setSelectedAddressId(newAddress.address_id);
      setShowNewAddressForm(false);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save address.");
    }

    setSavingAddress(false);
  };

  const safeCartTotal = isNaN(Number(cartTotal)) ? 0 : Number(cartTotal);
  const currentShippingFee = shippingInfo ? Number(shippingInfo.shipping_fee) || 0 : 0;
  const currentDiscount = shippingInfo ? Number(shippingInfo.discount) || 0 : 0;
  const currentTotal = shippingInfo ? Number(shippingInfo.total) : (safeCartTotal + currentShippingFee);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address.");
      setStep(1);
      return;
    }

    if (shippingError) {
      toast.error(shippingError);
      return;
    }

    if (!shippingInfo) {
      toast.error("Please wait for shipping rate calculation to finish.");
      return;
    }

    setPlacingOrder(true);

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        toast.error("Failed to load the payment gateway. Check your connection.");
        setPlacingOrder(false);
        return;
      }

      const res = await initiateCheckout(selectedAddressId);
      const { order_id, razorpay_order_id, amount, currency, key_id } = res.data;

      const prefill = {};
      if (user?.name) prefill.name = user.name;
      if (user?.email) prefill.email = user.email;
      if (user?.phone) prefill.contact = user.phone;

      const options = {
        key: key_id,
        amount: Math.round(amount * 100),
        currency,
        name: "Vintage Fashion",
        description: "Order payment",
        order_id: razorpay_order_id,
        prefill,
        config: {
          display: {
            blocks: {
              qrBlock: {
                name: "Pay using UPI QR",
                instruments: [{ method: "upi", flows: ["qr"] }],
              },
            },
            sequence: ["block.qrBlock"],
            preferences: { show_default_blocks: false },
          },
        },
        handler: async (response) => {
          try {
            await verifyPayment({
              order_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            clearCart();
            setStep(4);
          } catch (err) {
            toast.error("Payment verification failed. Please contact support.");
          } finally {
            setPlacingOrder(false);
          }
        },
        modal: {
          ondismiss: () => setPlacingOrder(false),
        },
        theme: { color: "#111827" },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start checkout.");
      setPlacingOrder(false);
    }
  };

  // Not logged in — the redirect effect above is already firing, so
  // render nothing rather than flashing checkout content first.
  if (!user) {
    return null;
  }

  if (step === 4) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Order Confirmed!</h2>
        <p className="text-sm text-gray-500 mb-8">Thank you for your purchase. You'll receive a confirmation email shortly.</p>
        <Link to="/" className="inline-block bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-pink-500 transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  // Still fetching addresses/settings or the cart itself — show a
  // lightweight loading state instead of a flash of empty content.
  if (pageLoading || cartLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center text-gray-400 text-sm">
        Loading checkout...
      </div>
    );
  }

  // Genuinely empty cart (not just "still loading") — nothing to check out.
  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-sm text-gray-400 mb-8">Add something to your cart before checking out.</p>
        <Link to="/shop" className="inline-block bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-pink-500 transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const steps = ["Shipping", "Review", "Payment"];
  const selectedAddress = addresses.find((a) => a.address_id === selectedAddressId);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <nav className="text-xs text-gray-400 mb-8">
        <Link to="/" className="hover:text-pink-500">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/cart" className="hover:text-pink-500">Cart</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700 font-medium">Checkout</span>
      </nav>

      {/* Step indicator */}
      <div className="flex items-center justify-center mb-12 gap-0">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest ${step === i + 1 ? "text-gray-900" : step > i + 1 ? "text-pink-500" : "text-gray-300"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step === i + 1 ? "border-gray-900 text-gray-900" : step > i + 1 ? "border-pink-500 bg-pink-500 text-white" : "border-gray-200 text-gray-300"}`}>
                {step > i + 1 ? "✓" : i + 1}
              </span>
              {s}
            </div>
            {i < steps.length - 1 && <div className={`w-12 h-px ${step > i + 1 ? "bg-pink-500" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Form */}
        <div className="flex-1">
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-6">Shipping Address</h2>

              {addresses.length > 0 && !showNewAddressForm && (
                <div className="space-y-3 mb-6">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.address_id;
                    return (
                      <label
                        key={addr.address_id}
                        className={`flex items-start gap-3 p-4 border cursor-pointer transition-all rounded ${isSelected ? "border-gray-900 bg-gray-50/50 shadow-sm" : "border-gray-200 hover:border-gray-400"}`}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={isSelected}
                          onChange={() => setSelectedAddressId(addr.address_id)}
                          className="mt-1 accent-gray-900"
                        />
                        <div className="text-sm flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-800">{addr.label || "Address"}</p>
                            {isSelected && shippingLoading && (
                              <span className="text-xs text-gray-400 animate-pulse">Checking delivery...</span>
                            )}
                          </div>
                          <p className="text-gray-500">
                            {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}
                          </p>
                          <p className="text-gray-500">{addr.city}, {addr.state} {addr.pincode}</p>
                          <p className="text-gray-500">{addr.country}</p>

                          {isSelected && shippingInfo && (
                            <div className="mt-2.5 pt-2 border-t border-gray-200/60 flex items-center gap-2">
                              {shippingInfo.delivery_method === "LOCAL" ? (
                                <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded font-medium">
                                  🛵 Local Store Delivery (Anantapur) · {Number(shippingInfo.shipping_fee) === 0 ? "FREE" : `₹ ${Number(shippingInfo.shipping_fee).toFixed(2)}`}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded font-medium">
                                  🚚 Express Courier {shippingInfo.courier_name ? `(${shippingInfo.courier_name})` : ""} · {Number(shippingInfo.shipping_fee) === 0 ? "FREE" : `₹ ${Number(shippingInfo.shipping_fee).toFixed(2)}`}
                                </span>
                              )}
                            </div>
                          )}

                          {isSelected && shippingError && (
                            <div className="mt-2.5 pt-2 border-t border-red-100 text-xs text-red-600 flex items-center gap-1.5 font-medium">
                              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {shippingError}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(true)}
                    className="text-xs font-bold uppercase tracking-widest text-pink-500 hover:text-pink-600"
                  >
                    + Add a new address
                  </button>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      disabled={!selectedAddressId || Boolean(shippingError) || shippingLoading}
                      onClick={() => setStep(2)}
                      className="bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-pink-500 transition-colors disabled:opacity-50"
                    >
                      {shippingLoading ? "Calculating Shipping..." : "Continue →"}
                    </button>
                  </div>
                </div>
              )}

              {(addresses.length === 0 || showNewAddressForm) && (
                <form onSubmit={handleSaveAddress}>
                  <div className="mb-4">
                    <label className="text-xs text-gray-500 mb-1 block">Label</label>
                    <input
                      name="label"
                      value={form.label}
                      onChange={handleChange}
                      className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="text-xs text-gray-500 mb-1 block">Address Line 1 *</label>
                    <input
                      name="address_line1"
                      value={form.address_line1}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="text-xs text-gray-500 mb-1 block">Address Line 2</label>
                    <input
                      name="address_line2"
                      value={form.address_line2}
                      onChange={handleChange}
                      className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">City *</label>
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">State *</label>
                      <input
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Pincode *</label>
                      <input
                        name="pincode"
                        value={form.pincode}
                        onChange={handleChange}
                        required
                        placeholder="e.g. 515001"
                        className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Country</label>
                      <input
                        value="India"
                        disabled
                        className="w-full border border-gray-200 px-3 py-2.5 text-sm bg-gray-50 text-gray-500"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 mb-6 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      name="is_default"
                      checked={form.is_default}
                      onChange={handleChange}
                      className="accent-gray-900"
                    />
                    Set as default address
                  </label>

                  <div className="flex justify-between">
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="text-xs font-bold uppercase tracking-widest border border-gray-200 px-6 py-3 hover:border-gray-900 transition-colors"
                      >
                        ← Back to saved addresses
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="ml-auto bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-pink-500 transition-colors disabled:opacity-60"
                    >
                      {savingAddress ? "Saving..." : "Save & Continue →"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-6">Review Your Order</h2>
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded">
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-400">
                        {item.size ? `Size: ${item.size} ` : ""}
                        {item.color ? `· Color: ${item.color} ` : ""}· Qty: {item.qty}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">₹ {((Number(item.price) || 0) * (Number(item.qty) || 1)).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {selectedAddress && (
                <div className="p-4 bg-gray-50 rounded border border-gray-100">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">Shipping to</h3>
                  <p className="text-sm font-medium text-gray-800">{selectedAddress.label}</p>
                  <p className="text-sm text-gray-600">
                    {selectedAddress.address_line1}{selectedAddress.address_line2 ? `, ${selectedAddress.address_line2}` : ""}
                  </p>
                  <p className="text-sm text-gray-600">{selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode}</p>
                  <p className="text-sm text-gray-600">{selectedAddress.country}</p>

                  {shippingInfo && (
                    <div className="mt-3 pt-3 border-t border-gray-200/70 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {shippingInfo.delivery_method === "LOCAL" ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded font-semibold">
                            🛵 Local Store Delivery (Anantapur)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded font-semibold">
                            🚚 Express Courier {shippingInfo.courier_name ? `via ${shippingInfo.courier_name}` : ""}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-gray-800">
                        {Number(shippingInfo.shipping_fee) === 0 ? "FREE" : `₹ ${Number(shippingInfo.shipping_fee).toFixed(2)}`}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {shippingError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{shippingError} Please go back and pick a serviceable address.</span>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold uppercase tracking-widest border border-gray-200 px-6 py-3 hover:border-gray-900 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={Boolean(shippingError) || !shippingInfo}
                  onClick={() => setStep(3)}
                  className="bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-pink-500 transition-colors disabled:opacity-50"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-6">Payment</h2>
              <p className="text-sm text-gray-500 mb-6">
                Pay securely using any UPI app — PhonePe, Paytm, or Google Pay.
              </p>

              {shippingInfo && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {shippingInfo.delivery_method === "LOCAL" ? (
                      <span className="font-semibold text-emerald-800">🛵 Local Store Delivery</span>
                    ) : (
                      <span className="font-semibold text-blue-800">🚚 Courier Delivery {shippingInfo.courier_name ? `(${shippingInfo.courier_name})` : ""}</span>
                    )}
                  </div>
                  <span className="font-medium text-gray-700">
                    Shipping: {Number(shippingInfo.shipping_fee) === 0 ? "FREE" : `₹ ${Number(shippingInfo.shipping_fee).toFixed(2)}`}
                  </span>
                </div>
              )}

              {shippingError ? (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded text-sm mb-6">
                  <p className="font-bold mb-1">⚠️ Delivery Service Unavailable</p>
                  <p className="text-xs">{shippingError}</p>
                </div>
              ) : (
                <div className="flex items-center gap-4 mb-8 p-4 border border-gray-200 rounded">
                  <span className="text-sm font-semibold text-gray-800">UPI</span>
                  <span className="text-xs text-gray-400">PhonePe · Paytm · Google Pay · QR Code</span>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-bold uppercase tracking-widest border border-gray-200 px-6 py-3 hover:border-gray-900 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || Boolean(shippingError) || !shippingInfo}
                  className="bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-pink-500 transition-colors disabled:opacity-60"
                >
                  {placingOrder ? "Processing..." : shippingError ? "Delivery Unavailable" : `Pay ₹ ${currentTotal.toFixed(2)} with UPI`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="lg:w-80">
          <div className="bg-gray-50 p-6 sticky top-24 rounded border border-gray-200/70">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4 text-sm max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-gray-500 truncate flex-1">{item.name} × {item.qty}</span>
                  <span className="font-semibold ml-2">
                    ₹ {((Number(item.price) || 0) * (Number(item.qty) || 1)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold">₹ {safeCartTotal.toFixed(2)}</span>
              </div>

              {currentDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-semibold">- ₹ {currentDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-gray-500">Delivery Fee</span>
                  {shippingInfo && (
                    <span className="text-[10px] text-gray-400">
                      {shippingInfo.delivery_method === "LOCAL" ? "🛵 Local Delivery" : "🚚 Express Courier"}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  {shippingLoading ? (
                    <span className="text-xs text-gray-400 animate-pulse">Calculating...</span>
                  ) : shippingError ? (
                    <span className="text-xs font-semibold text-red-500">Unserviceable</span>
                  ) : (
                    <span className={`font-semibold ${currentShippingFee === 0 ? "text-emerald-600" : "text-gray-800"}`}>
                      {currentShippingFee === 0 ? "FREE" : `₹ ${currentShippingFee.toFixed(2)}`}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-base">
                <span>Total</span>
                <span>₹ {currentTotal.toFixed(2)}</span>
              </div>
            </div>

            {shippingError && (
              <div className="mt-3 p-2 bg-red-50 text-[11px] text-red-600 rounded border border-red-100">
                ⚠️ Pincode is currently unserviceable.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}