import { Link } from "react-router-dom";
import { useSiteData } from "../../hooks/useSiteData";

export default function Hero() {
  const { siteText } = useSiteData();

  return (
    <section className="relative bg-gray-100 overflow-hidden min-h-[520px] flex items-center">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1400&h=700&fit=crop"
          alt="Stylish Male Clothes"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gray-100/30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 flex items-center w-full">
        <div className="ml-auto max-w-sm text-right">
          <p className="text-sm font-medium text-gray-600 tracking-[0.3em] uppercase mb-2 flex items-center justify-end gap-3">
            <span className="block w-8 h-px bg-gray-600" />
            {siteText.heroEyebrow}
            <span className="block w-8 h-px bg-gray-600" />
          </p>
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-3">
            {siteText.heroTitle}
          </h1>
          <p className="text-sm text-gray-500 mb-8">{siteText.heroSubtitle}</p>
          <Link
            to="/shop"
            className="inline-block border border-gray-900 text-gray-900 text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-gray-900 hover:text-white transition-all duration-300"
          >
            {siteText.heroCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
