export default function StatCard({ label, value, change, positive = true, icon }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</span>
        <span className="w-9 h-9 bg-pink-50 text-pink-500 rounded-lg flex items-center justify-center">
          <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        </span>
      </div>
      <p className="text-2xl font-extrabold text-gray-900 mb-1">{value}</p>
      {change && (
        <p className={`text-xs font-medium flex items-center gap-1 ${positive ? "text-green-500" : "text-red-500"}`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {positive
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />}
          </svg>
          {change}
        </p>
      )}
    </div>
  );
}
