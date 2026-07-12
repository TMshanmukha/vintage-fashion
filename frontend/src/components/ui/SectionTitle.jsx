export default function SectionTitle({ title, subtitle }) {
  return (
    <div className="text-center mb-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <div className="w-10 h-0.5 bg-gray-900 mx-auto mb-3" />
      {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
    </div>
  );
}
