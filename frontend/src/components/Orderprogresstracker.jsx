import React from "react";

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
    shortLabel: "Ordered",
    desc: "Payment verified",
    icon: (
      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  {
    label: "Processing",
    shortLabel: "Packed",
    desc: "Packed & verified",
    icon: (
      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    label: "Picked Up",
    shortLabel: "Picked",
    desc: "Courier picked up",
    icon: (
      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
  },
  {
    label: "In Transit",
    shortLabel: "Transit",
    desc: "Moving through hub",
    icon: (
      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    label: "Out for Delivery",
    shortLabel: "Out",
    desc: "With courier agent",
    icon: (
      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Delivered",
    shortLabel: "Delivered",
    desc: "Package handed over",
    icon: (
      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function OrderProgressTracker({ orderStatus, shippingStatus }) {
  if (orderStatus === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/70 p-4 text-sm font-medium text-red-700">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold shrink-0">✕</span>
        <div>
          <p className="font-bold text-red-800">This order was cancelled</p>
          <p className="text-xs text-red-600">If any payment was deducted, it will be refunded back to your payment method in 3–5 business days.</p>
        </div>
      </div>
    );
  }

  const currentIndex = resolveStepIndex(orderStatus, shippingStatus);
  const currentStep = STEPS[currentIndex] || STEPS[0];

  return (
    <div className="w-full overflow-hidden space-y-3.5 py-1">
      {/* Sleek Horizontal Stepper with In-line Connectors (Zero Overflow) */}
      <div className="w-full bg-gray-50/90 border border-gray-100/90 rounded-2xl p-3 sm:p-4 shadow-xs">
        <div className="w-full flex items-center justify-between">
          {STEPS.map((step, i) => {
            const isCompleted = i < currentIndex;
            const isCurrent = i === currentIndex;
            const isLast = i === STEPS.length - 1;

            return (
              <React.Fragment key={step.label}>
                {/* Step Node */}
                <div className="flex flex-col items-center shrink-0 group relative">
                  <div
                    className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-all duration-300 text-xs font-bold ${
                      isCompleted
                        ? "bg-pink-600 text-white shadow-sm shadow-pink-500/30"
                        : isCurrent
                        ? "bg-gray-900 text-white ring-3 ring-pink-500/20 shadow-md scale-110"
                        : "bg-white text-gray-400 border border-gray-200"
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.icon
                    )}
                  </div>
                </div>

                {/* Inline Flexible Connecting Line between nodes */}
                {!isLast && (
                  <div
                    className={`flex-1 h-[2.5px] mx-1 rounded-full transition-all duration-500 min-w-[10px] ${
                      i < currentIndex ? "bg-pink-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Concise Step Labels Row */}
        <div className="grid grid-cols-6 gap-1 mt-2.5 pt-1 text-center">
          {STEPS.map((step, i) => {
            const isCompleted = i < currentIndex;
            const isCurrent = i === currentIndex;

            return (
              <div key={step.label} className="flex flex-col items-center">
                <span
                  className={`text-[9px] sm:text-[10px] leading-tight font-bold transition-colors truncate max-w-full ${
                    isCurrent
                      ? "text-pink-600 font-extrabold"
                      : isCompleted
                      ? "text-gray-800"
                      : "text-gray-400 font-medium"
                  }`}
                  title={step.label}
                >
                  {step.shortLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Stage Highlight Card */}
      <div className="rounded-xl border border-pink-100 bg-gradient-to-r from-pink-50/80 via-white to-rose-50/50 p-3.5 flex items-start gap-3 shadow-xs">
        <div className="w-8 h-8 rounded-lg bg-pink-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          {currentStep.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-600">
              Current Stage: {currentStep.label}
            </span>
            {currentIndex === 5 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800">
                Completed
              </span>
            )}
          </div>
          <p className="text-xs text-gray-700 font-medium mt-0.5">
            {currentStep.desc}
          </p>
        </div>
      </div>
    </div>
  );
}