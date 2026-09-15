export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText,
  cancelText = "Cancel",
  confirmColor,
  variant = "danger",
  onConfirm,
  onCancel,
  loading = false,
  maxWidth = "max-w-md",
}) {
  if (!open) return null;

  const isDelete =
    variant === "danger" ||
    (typeof title === "string" && title.toLowerCase().includes("delete"));
  const isRefund =
    variant === "success" ||
    (typeof title === "string" && title.toLowerCase().includes("refund"));
  const isPickup =
    variant === "purple" ||
    (typeof title === "string" && title.toLowerCase().includes("pickup"));

  const defaultConfirmText = isDelete ? "Delete" : "Confirm";
  const btnText = confirmText || defaultConfirmText;

  let iconBg = "bg-rose-50 text-rose-600";
  let btnClass = "bg-rose-600 hover:bg-rose-700 text-white";

  if (confirmColor) {
    btnClass = `${confirmColor} text-white`;
  } else if (isPickup) {
    iconBg = "bg-purple-50 text-purple-600";
    btnClass = "bg-purple-600 hover:bg-purple-700 text-white shadow-sm";
  } else if (isRefund) {
    iconBg = "bg-emerald-50 text-emerald-600";
    btnClass = "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm";
  } else if (variant === "primary" || !isDelete) {
    iconBg = "bg-gray-100 text-gray-800";
    btnClass = "bg-gray-900 hover:bg-gray-800 text-white shadow-sm";
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-2xl p-6 ${maxWidth} w-full shadow-2xl border border-gray-100 transition-all`}
      >
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shrink-0`}
          >
            {isPickup ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            ) : isRefund ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : isDelete ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 leading-snug">{title}</h3>
            <div className="mt-1 text-sm text-gray-500 leading-relaxed">{message}</div>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 border border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${btnClass}`}
          >
            {loading && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {btnText}
          </button>
        </div>
      </div>
    </div>
  );
}
