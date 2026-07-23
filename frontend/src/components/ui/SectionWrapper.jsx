export default function SectionWrapper({ children, muted = false, className = "" }) {
  return (
    <section className={`border-t border-gray-100 ${muted ? "bg-gray-50" : "bg-white"} ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-16">{children}</div>
    </section>
  );
}