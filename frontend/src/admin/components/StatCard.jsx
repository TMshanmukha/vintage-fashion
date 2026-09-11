export default function StatCard({ label, value, change, positive = true, icon, color = "pink" }) {
  const colorStyles = {
    pink: {
      bg: "bg-gradient-to-br from-white via-pink-50/40 to-pink-100/30",
      border: "border-pink-200/90 hover:border-pink-300",
      iconBg: "bg-pink-100 text-pink-700 ring-4 ring-pink-50",
      valueColor: "text-gray-900",
      glow: "shadow-pink-500/5",
    },
    emerald: {
      bg: "bg-gradient-to-br from-white via-emerald-50/40 to-emerald-100/30",
      border: "border-emerald-200/90 hover:border-emerald-300",
      iconBg: "bg-emerald-100 text-emerald-800 ring-4 ring-emerald-50",
      valueColor: "text-emerald-950",
      glow: "shadow-emerald-500/5",
    },
    amber: {
      bg: "bg-gradient-to-br from-white via-amber-50/40 to-amber-100/30",
      border: "border-amber-200/90 hover:border-amber-300",
      iconBg: "bg-amber-100 text-amber-800 ring-4 ring-amber-50",
      valueColor: "text-amber-950",
      glow: "shadow-amber-500/5",
    },
    purple: {
      bg: "bg-gradient-to-br from-white via-purple-50/40 to-purple-100/30",
      border: "border-purple-200/90 hover:border-purple-300",
      iconBg: "bg-purple-100 text-purple-800 ring-4 ring-purple-50",
      valueColor: "text-purple-950",
      glow: "shadow-purple-500/5",
    },
    indigo: {
      bg: "bg-gradient-to-br from-white via-indigo-50/40 to-indigo-100/30",
      border: "border-indigo-200/90 hover:border-indigo-300",
      iconBg: "bg-indigo-100 text-indigo-800 ring-4 ring-indigo-50",
      valueColor: "text-indigo-950",
      glow: "shadow-indigo-500/5",
    },
    blue: {
      bg: "bg-gradient-to-br from-white via-sky-50/40 to-sky-100/30",
      border: "border-sky-200/90 hover:border-sky-300",
      iconBg: "bg-sky-100 text-sky-800 ring-4 ring-sky-50",
      valueColor: "text-sky-950",
      glow: "shadow-sky-500/5",
    },
  };

  const currentStyle = colorStyles[color] || colorStyles.pink;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${currentStyle.bg} ${currentStyle.border} ${currentStyle.glow}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-500 truncate">{label}</span>
        <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${currentStyle.iconBg}`}>
          <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        </span>
      </div>
      <p className={`text-2xl sm:text-3xl font-black tracking-tight mt-1 truncate ${currentStyle.valueColor}`}>
        {value !== undefined && value !== null && value !== "" ? value : "0"}
      </p>
      {change && (
        <p className={`text-[11px] font-bold mt-2 flex items-center gap-1 truncate ${positive ? "text-emerald-700" : "text-amber-700"}`}>
          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {positive ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            )}
          </svg>
          <span className="truncate">{change}</span>
        </p>
      )}
    </div>
  );
}
