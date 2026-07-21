import { useMemo, useState } from "react";
import { Link, Navigate,useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { logout } from "../api/auth.api";

const demoOrders = [
  {
    id: "ORD-1027",
    date: "2026-06-28",
    status: "Shipped",
    total: 129.98,
    canCancel: false,
    canReturn: true,
    items: [
      {
        id: 1,
        name: "Relaxed Cotton Shirt",
        price: 59.99,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80",
      },
      {
        id: 2,
        name: "Classic Denim Jacket",
        price: 69.99,
        image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=700&q=80",
      },
    ],
  },
  {
    id: "ORD-1019",
    date: "2026-06-21",
    status: "Delivered",
    total: 84.5,
    canCancel: false,
    canReturn: true,
    items: [
      {
        id: 3,
        name: "Summer Floral Dress",
        price: 84.5,
        image: "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=700&q=80",
      },
    ],
  },
  {
    id: "ORD-1008",
    date: "2026-06-15",
    status: "Processing",
    total: 45,
    canCancel: true,
    canReturn: false,
    items: [
      {
        id: 4,
        name: "Oversized Graphic Tee",
        price: 45,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80",
      },
    ],
  },
];

const statusStyles = {
  Processing: "bg-amber-50 text-amber-700 border-amber-200",
  Shipped: "bg-blue-50 text-blue-700 border-blue-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-gray-100 text-gray-600 border-gray-200",
  "Return requested": "bg-purple-50 text-purple-700 border-purple-200",
};



export default function MyAccountPage() {
 
  const navigate = useNavigate();

  const {
      user,
      logoutLocal
  } = useAuth();

  const [orders, setOrders] = useState(demoOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [message, setMessage] = useState("");

  const totalSpent = useMemo(() => {
    return orders
      .filter((order) => order.status !== "Cancelled")
      .reduce((sum, order) => sum + order.total, 0);
  }, [orders]);

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

  const handleCancelOrder = (order) => {
    const confirmed = window.confirm(`Do you want to cancel order ${order.id}?`);

    if (!confirmed) return;

    setOrders((currentOrders) =>
      currentOrders.map((currentOrder) =>
        currentOrder.id === order.id
          ? { ...currentOrder, status: "Cancelled", canCancel: false, canReturn: false }
          : currentOrder
      )
    );
    setSelectedOrder(null);
    setMessage(`${order.id} has been cancelled.`);
  };

  const handleReturnOrder = (order) => {
    setOrders((currentOrders) =>
      currentOrders.map((currentOrder) =>
        currentOrder.id === order.id
          ? { ...currentOrder, status: "Return requested", canCancel: false, canReturn: false }
          : currentOrder
      )
    );
    setMessage(`Return request created for ${order.id}.`);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-pink-500">My account</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Orders and returns</h1>
            <p className="mt-2 text-sm text-gray-500">
              Welcome {user?.name  || "back"}. Track orders, cancel eligible orders, and request returns.
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
            <p className="mt-2 text-3xl font-extrabold text-gray-900">${totalSpent.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total orders</p>
            <p className="mt-2 text-3xl font-extrabold text-gray-900">{orders.length}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Return available</p>
            <p className="mt-2 text-3xl font-extrabold text-gray-900">
              {orders.filter((order) => order.canReturn).length}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            {orders.map((order) => (
              <article key={order.id} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <button type="button" onClick={() => setSelectedOrder(order)} className="text-left">
                    <h2 className="text-lg font-bold text-gray-900">{order.id}</h2>
                    <p className="mt-1 text-sm text-gray-500">Placed on {order.date}</p>
                  </button>
                  <span className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[order.status] || statusStyles.Processing}`}>
                    {order.status}
                  </span>
                </div>

                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                  {order.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="flex min-w-56 items-center gap-3 rounded-md border border-gray-100 p-2 text-left transition hover:border-pink-200"
                    >
                      <img src={item.image} alt={item.name} className="h-16 w-16 rounded-md object-cover" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{item.name}</p>
                        <p className="mt-1 text-sm text-gray-500">${item.price.toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-base font-extrabold text-gray-900">Order total: ${order.total.toFixed(2)}</p>
                  <div className="flex gap-2">
                    {order.canCancel && (
                      <button onClick={() => handleCancelOrder(order)} className="rounded-md border border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50">
                        Cancel order
                      </button>
                    )}
                    {order.canReturn && (
                      <button onClick={() => handleReturnOrder(order)} className="rounded-md border border-pink-200 px-4 py-2 text-sm font-bold text-pink-500 transition hover:bg-pink-50">
                        Return item
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:h-fit">
            {selectedOrder ? (
              <>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selectedOrder.id}</h2>
                    <p className="mt-1 text-sm text-gray-500">Status: {selectedOrder.status}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="text-gray-400 transition hover:text-pink-500">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="overflow-hidden rounded-lg border border-gray-100">
                      <img src={item.image} alt={item.name} className="aspect-[4/3] w-full object-cover" />
                      <div className="p-3">
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="mt-1 text-sm text-gray-500">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-2">
                  {selectedOrder.canCancel && (
                    <button onClick={() => handleCancelOrder(selectedOrder)} className="w-full rounded-md bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-600">
                      Cancel this order
                    </button>
                  )}
                  {selectedOrder.canReturn && (
                    <button onClick={() => handleReturnOrder(selectedOrder)} className="w-full rounded-md bg-pink-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-pink-600">
                      Request return
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="py-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pink-50 text-pink-500">
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Select an order</h2>
                <p className="mt-2 text-sm text-gray-500">Click an order to see product pictures, cancel options, and return actions.</p>
              </div>
            )}
          </aside>
        </div>

        <Link to="/shop" className="mt-8 inline-block text-sm font-bold text-pink-500">
          Continue shopping
        </Link>
      </section>
    </main>
  );
}
