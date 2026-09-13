// Shiprocket status resolver & Amazon-style progress tracker
function resolveStepIndex(orderStatus, shippingStatus) {
  if (orderStatus === "cancelled") return -1;
  if (orderStatus === "pending") return 0; // Confirmed (paid)
  if (!shippingStatus) {
    if (orderStatus === "confirmed") return 0;
    if (orderStatus === "processing") return 1;
    if (orderStatus === "shipped") return 3;
    if (orderStatus === "delivered") return 5;
    return 1;
  }

  const s = shippingStatus.toLowerCase();
  if (/deliver|complete/.test(s)) return 5;
  if (/out for delivery/.test(s)) return 4;
  if (/transit|in transit|reached|hub|dispatched/.test(s)) return 3;
  if (/picked up|pickup complete|manifest/.test(s)) return 2;
  if (/shipment created|awb|processing|ready/.test(s)) return 1;

  return 1;
}

const STEPS = [
  {
    label: "Ordered",
    desc: "Payment verified",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    label: "Processing",
    desc: "Packed & verified",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    label: "Picked Up",
    desc: "Courier picked up",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
  },
  {
    label: "In Transit",
    desc: "Moving through hub",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    label: "Out for Delivery",
    desc: "With courier agent",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Delivered",
    desc: "Package handed over",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function OrderProgressTracker({ orderStatus, shippingStatus }) {
  if (orderStatus === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/70 p-4 text-sm font-medium text-red-700">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold">✕</span>
        <div>
          <p className="font-bold text-red-800">This order was cancelled</p>
          <p className="text-xs text-red-600">If any payment was deducted, it will be refunded back to the original method in 3–5 business days.</p>
        </div>
      </div>
    );
  }

  const currentIndex = resolveStepIndex(orderStatus, shippingStatus);

  return (
    <div className="w-full py-2">
      {/* Stepper Timeline */}
      <div className="relative flex items-center justify-between">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isLast = i === STEPS.length - 1;

          return (
            <div key={step.label} className="relative flex flex-1 items-center">
              {/* Node */}
              <div className="flex flex-col items-center z-10 mx-auto">
                <div
                  className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full transition-all duration-300 font-bold text-xs ${
                    isCompleted
                      ? "bg-pink-600 text-white shadow-md shadow-pink-500/20"
                      : isCurrent
                      ? "bg-gray-900 text-white ring-4 ring-pink-100 shadow-lg"
                      : "bg-gray-100 text-gray-400 border border-gray-200"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </div>

                {/* Labels */}
                <div className="mt-2 text-center">
                  <span
                    className={`block text-[11px] sm:text-xs font-bold transition-colors ${
                      isCurrent
                        ? "text-pink-600"
                        : isCompleted
                        ? "text-gray-900"
                        : "text-gray-400 font-medium"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="hidden sm:block text-[10px] text-gray-400 mt-0.5 max-w-[80px] truncate">
                    {step.desc}
                  </span>
                </div>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div
                  className={`absolute top-4 sm:top-4.5 left-1/2 w-full h-[3px] -z-0 transition-all duration-500 ${
                    i < currentIndex ? "bg-pink-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}