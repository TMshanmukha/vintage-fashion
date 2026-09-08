import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBanners } from "../../api/marketingApi";

// Fixed curated backdrop — always rotates regardless of admin banner count.
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1600&h=800&fit=crop", // menswear rack
  "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&h=800&fit=crop", // clothing store interior
  "https://images.unsplash.com/photo-1562263689-1001cf97d149?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // fashion model street style
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&h=800&fit=crop", // vintage jacket flatlay
];

const DEFAULT_TEXT = {
  subtitle: "Stylish",
  title: "Vintage Fashion",
  description: "Timeless pieces, curated for today.",
  button_text: "🛍️ Shop Now",
  button_link: "/shop",
  banner_id: null,
  discount_percent: 0,
};

const ROTATE_MS = 5000;

export default function Hero() {
  const [imageIndex, setImageIndex] = useState(0);
  const [text, setText] = useState(DEFAULT_TEXT);

  // Background rotates on its own timer, always, regardless of admin data.
  useEffect(() => {
    const timer = setInterval(
      () => setImageIndex((i) => (i + 1) % HERO_IMAGES.length),
      ROTATE_MS
    );
    return () => clearInterval(timer);
  }, []);

  // Text/CTA still pulled from admin's active banner when one exists.
  useEffect(() => {
    let mounted = true;
    getBanners()
      .then((res) => {
        if (!mounted) return;
        const active = (res.data?.data || []).find((b) => b.status === "ACTIVE");
        if (active) {
          setText({
            subtitle: active.subtitle || "",
            title: active.title,
            description: active.description || "",
            button_text: active.button_text || "Shop Now",
            button_link: active.button_link || "/shop",
            banner_id: active.banner_id,
            discount_percent: Number(active.discount_percent) || 0,
          });
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // When the active banner has a discount, send users to its dedicated
  // offer page (which lists only the products tagged to it, discounted)
  // instead of the plain button_link.
  const linkTarget =
    text.discount_percent > 0 && text.banner_id
      ? `/offer/banner/${text.banner_id}`
      : text.button_link;

  return (
    <section className="relative bg-gray-100 overflow-hidden min-h-[560px] flex items-center">
      {HERO_IMAGES.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
            i === imageIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={src}
            alt="Vintage fashion collection"
            className={`w-full h-full object-cover object-center transition-transform duration-[6000ms] ease-out ${
              i === imageIndex ? "scale-110" : "scale-100"
            }`}
          />
          <div className="absolute inset-0 bg-gray-900/25" />
        </div>
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28 flex items-center w-full justify-center lg:justify-end">
        <div className="max-w-md lg:max-w-lg text-center lg:text-right lg:ml-auto">
          {text.subtitle && (
            <p className="text-sm font-medium text-white/90 tracking-[0.3em] uppercase mb-3 flex items-center justify-center lg:justify-end gap-3">
              <span className="block w-8 h-px bg-white/70" />
              {text.subtitle}
              <span className="block w-8 h-px bg-white/70 lg:hidden" />
            </p>
          )}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 drop-shadow-md">
            {text.title}
          </h1>
          {text.description && (
            <p className="text-sm md:text-base text-white/90 mb-8 max-w-md lg:ml-auto leading-relaxed drop-shadow">
              {text.description}
            </p>
          )}
          <div className="flex justify-center lg:justify-end">
            <Link
              to={linkTarget}
              className="inline-block border-2 border-white bg-white/10 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 hover:bg-white hover:text-gray-900 transition-all duration-300 shadow-lg"
            >
              {text.button_text}
            </Link>
          </div>

          <div className="flex justify-center lg:justify-end gap-2 mt-8">
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setImageIndex(i)}
                aria-label={`Go to background ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === imageIndex ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}