const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8M10 12v4M14 12v4" />
      </svg>
    ),
    title: "Free Shipping",
    desc: "Free shipping on all orders over ₹1000. No hidden costs, no surprises at checkout.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Support Hours",
    desc: "Our customer support team is available Monday – Saturday, 9:00 AM – 6:00 PM.",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Money Return",
    desc: "Not satisfied? Return within 7 days for a full refund.",
  },
];

export default function FeaturesBar() {
  return (
    <section>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-3 md:divide-x divide-gray-100">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex flex-col items-center text-center py-5 px-2 gap-1.5 md:py-10 md:px-8 md:gap-3"
            >
              <span className="text-gray-400 [&>svg]:w-5 [&>svg]:h-5 md:[&>svg]:w-8 md:[&>svg]:h-8">
                {f.icon}
              </span>
              <h3 className="text-[11px] leading-tight md:text-sm font-bold text-gray-900">
                {f.title}
              </h3>
              <p className="hidden md:block text-xs text-gray-400 leading-relaxed max-w-xs">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}