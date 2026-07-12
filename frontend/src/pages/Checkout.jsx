import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", zip: "", country: "India",
    payment: "card",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
    else { clearCart(); setStep(4); }
  };

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

  const steps = ["Shipping", "Review", "Payment"];

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
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-6">Shipping Information</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[["firstName", "First Name"], ["lastName", "Last Name"]].map(([name, label]) => (
                    <div key={name}>
                      <label className="text-xs text-gray-500 mb-1 block">{label} *</label>
                      <input name={name} value={form[name]} onChange={handleChange} required
                        className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors" />
                    </div>
                  ))}
                </div>
                {[["email", "Email Address", "email"], ["phone", "Phone Number", "tel"], ["address", "Street Address", "text"], ["city", "City", "text"], ["zip", "ZIP / Postal Code", "text"]].map(([name, label, type]) => (
                  <div key={name} className="mb-4">
                    <label className="text-xs text-gray-500 mb-1 block">{label} *</label>
                    <input name={name} type={type} value={form[name]} onChange={handleChange} required
                      className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors" />
                  </div>
                ))}
                <div className="mb-6">
                  <label className="text-xs text-gray-500 mb-1 block">Country *</label>
                  <select name="country" value={form.country} onChange={handleChange}
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-500 bg-white">
                    {["Romania", "United States", "United Kingdom", "Germany", "France"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-6">Review Your Order</h2>
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50">
                      <img src={item.image} alt={item.name} className="w-14 h-14 object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                      </div>
                      <span className="text-sm font-semibold">$ {(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gray-50">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-3">Shipping to</h3>
                  <p className="text-sm text-gray-600">{form.firstName} {form.lastName}</p>
                  <p className="text-sm text-gray-600">{form.address}, {form.city} {form.zip}</p>
                  <p className="text-sm text-gray-600">{form.country}</p>
                  <p className="text-sm text-gray-600">{form.email}</p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-6">Payment</h2>
                <div className="space-y-3 mb-8">
                  {[["card", "Credit / Debit Card"], ["paypal", "PayPal"], ["cash", "Cash on Delivery"]].map(([val, label]) => (
                    <label key={val} className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${form.payment === val ? "border-gray-900" : "border-gray-200 hover:border-gray-400"}`}>
                      <input type="radio" name="payment" value={val} checked={form.payment === val} onChange={handleChange} className="accent-gray-900" />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
                {form.payment === "card" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Card Number</label>
                      <input placeholder="1234 5678 9012 3456" className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Expiry Date</label>
                        <input placeholder="MM / YY" className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-500" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">CVV</label>
                        <input placeholder="123" className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-pink-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 1 ? (
                <button type="button" onClick={() => setStep(step - 1)}
                  className="text-xs font-bold uppercase tracking-widest border border-gray-200 px-6 py-3 hover:border-gray-900 transition-colors">
                  ← Back
                </button>
              ) : <div />}
              <button type="submit"
                className="bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-pink-500 transition-colors">
                {step === 3 ? "Place Order" : "Continue →"}
              </button>
            </div>
          </form>
        </div>

        {/* Summary */}
        <div className="lg:w-80">
          <div className="bg-gray-50 p-6 sticky top-24">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4 text-sm">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-gray-500 truncate flex-1">{item.name} × {item.qty}</span>
                  <span className="font-semibold ml-2">$ {(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold">$ {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="font-semibold text-green-500">{cartTotal >= 200 ? "Free" : "$ 9.99"}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>$ {(cartTotal + (cartTotal >= 200 ? 0 : 9.99)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
