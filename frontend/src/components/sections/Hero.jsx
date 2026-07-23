import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBanners } from "../../api/marketingApi";

// Fixed curated backdrop — always rotates regardless of admin banner count.
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1600&h=800&fit=crop", // menswear rack
  "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1600&h=800&fit=crop", // vintage denim
  "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&h=800&fit=crop", // clothing store interior
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&h=800&fit=crop", // fashion model street style
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&h=800&fit=crop", // vintage jacket flatlay
];

const DEFAULT_TEXT = {
  subtitle: "Stylish",
  title: "Vintage Fashion",
  description: "Timeless pieces, curated for today.",
  button_text: "🛍️ Shop Now",
  button_link: "/shop",
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
          });
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

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

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex items-center w-full">
        <div className="ml-auto max-w-sm text-right">
          {text.subtitle && (
            <p className="text-sm font-medium text-white/90 tracking-[0.3em] uppercase mb-2 flex items-center justify-end gap-3">
              <span className="block w-8 h-px bg-white/70" />
              {text.subtitle}
              <span className="block w-8 h-px bg-white/70" />
            </p>
          )}
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-3 drop-shadow-sm">
            {text.title}
          </h1>
          {text.description && (
            <p className="text-sm text-white/90 mb-8">{text.description}</p>
          )}
          <Link
            to={text.button_link}
            className="inline-block border border-white text-white text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-white hover:text-gray-900 transition-all duration-300"
          >
            {text.button_text}
          </Link>

          <div className="flex justify-end gap-2 mt-6">
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setImageIndex(i)}
                aria-label={`Go to background ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === imageIndex ? "w-6 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}