// Shiprocket's status strings are free text, not a fixed enum — this
// matches loosely by keyword rather than an exact string, since the
// exact phrasing can vary slightly between couriers.
function resolveStepIndex(orderStatus, shippingStatus) {
  if (orderStatus === "pending") return 0;   // Confirmed (paid, not yet shipped)
  if (!shippingStatus) return 1;              // Confirmed, no shipment yet -> Processing

  const s = shippingStatus.toLowerCase();

  if (/deliver/.test(s)) return 5;
  if (/out for delivery/.test(s)) return 4;
  if (/transit|in transit|reached|hub/.test(s)) return 3;
  if (/picked up|pickup complete/.test(s)) return 2;
  if (/shipment created|awb|manifest/.test(s)) return 1;

  return 1; // fallback: something exists but doesn't match known phrases
}

const STEPS = [
  { label: "Confirmed" },
  { label: "Processing" },
  { label: "Picked Up" },
  { label: "In Transit" },
  { label: "Out for Delivery" },
  { label: "Delivered" },
];

export default function OrderProgressTracker({ orderStatus, shippingStatus }) {
  if (orderStatus === "cancelled") {
    return (
      <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-500">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = resolveStepIndex(orderStatus, shippingStatus);

  return (
    <div className="flex items-center justify-between">
      {STEPS.map((step, i) => {
        const reached = i <= currentIndex;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={step.label} className="flex flex-1 items-center">
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