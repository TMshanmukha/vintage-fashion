import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";

export default function Cart() {
  const { cartItems, updateQty, removeFromCart, cartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-sm text-gray-400 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="inline-block bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-pink-500 transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <nav className="text-xs text-gray-400 mb-8">
        <Link to="/" className="hover:text-pink-500">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700 font-medium">Cart</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Items */}
        <div className="flex-1">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold uppercase tracking-widest text-gray-500">
                <th className="text-left pb-4">Product</th>
                <th className="text-center pb-4">Price</th>
                <th className="text-center pb-4">Qty</th>
                <th className="text-right pb-4">Total</th>
                <th className="pb-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cartItems.map((item) => (
                <tr key={item.id} className="py-4">
                  <td className="py-4">
                    <div className="flex items-center gap-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover bg-gray-50" />
                      <span className="text-sm font-medium text-gray-800">{item.name}</span>
                    </div>
                  </td>
                  <td className="text-center text-sm text-gray-600">$ {item.price.toFixed(2)}</td>
                  <td className="text-center">
                    <div className="flex items-center justify-center border border-gray-200 w-fit mx-auto">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="px-3 py-1.5 text-gray-500 hover:text-gray-900">−</button>
                      <span className="px-3 py-1.5 text-sm border-x border-gray-200">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-3 py-1.5 text-gray-500 hover:text-gray-900">+</button>
                    </div>
                  </td>
                  <td className="text-right text-sm font-semibold text-gray-800">
                    $ {(item.price * item.qty).toFixed(2)}
                  </td>
                  <td className="text-right pl-4">
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-pink-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 flex justify-between">
            <Link to="/shop" className="text-xs font-bold uppercase tracking-widest border border-gray-200 px-6 py-3 hover:border-gray-900 transition-colors">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:w-80">
          <div className="bg-gray-50 p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-6">Order Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold">$ {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-semibold text-green-500">{cartTotal >= 200 ? "Free" : "$ 9.99"}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-sm font-bold">
                <span>Total</span>
                <span>$ {(cartTotal + (cartTotal >= 200 ? 0 : 9.99)).toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Coupon code"
                className="flex-1 border border-gray-200 text-xs px-3 py-2 outline-none focus:border-pink-500"
              />
              <button className="bg-gray-900 text-white text-xs font-bold uppercase px-4 py-2 hover:bg-pink-500 transition-colors">
                Apply
              </button>
            </div>

            <Link
              to="/checkout"
              className="block w-full bg-gray-900 text-white text-center text-xs font-bold uppercase tracking-widest py-4 hover:bg-pink-500 transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
