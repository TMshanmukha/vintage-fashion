const STEPS = [
  { key: "pending", label: "Confirmed" },     // customer-facing label — see labels note
  { key: "confirmed", label: "Processing" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

export default function OrderProgressTracker({ orderStatus }) {
  if (orderStatus === "cancelled") {
    return (
      <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-500">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.key === orderStatus);

  return (
    <div className="flex items-center justify-between">
      {STEPS.map((step, i) => {
        const reached = i <= currentIndex;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={step.key} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold ${
                  reached
                    ? "border-pink-500 bg-pink-500 text-white"
                    : "border-gray-200 bg-white text-gray-300"
                }`}
              >
                {reached ? "✓" : i + 1}
              </div>
              <span className={`mt-2 text-[11px] font-semibold ${reached ? "text-gray-900" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={`mx-1 h-0.5 flex-1 ${i < currentIndex ? "bg-pink-500" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}