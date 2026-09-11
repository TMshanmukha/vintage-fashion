import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getCards } from "../../api/marketingApi";
import SectionTitle from "../ui/SectionTitle";
import SectionWrapper from "../ui/SectionWrapper";
import { getOptimizedImageUrl } from "../../utils/imageOptimizer";

const EYEBROWS = ["New In", "Trending Now", "Editor's Pick", "Limited Edition"];

function PromotionalCardsSkeleton() {
  return (
    <SectionWrapper compact>
      <SectionTitle title="Shop by Edit" subtitle="Curated drops and seasonal picks, refreshed regularly." />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-72 sm:h-96 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    </SectionWrapper>
  );
}

export default function PromotionalCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    let mounted = true;
    getCards()
      .then((res) => mounted && setCards((res.data?.data || []).filter((c) => c.is_active)))
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const isCarousel = cards.length >= 4;

  const updateScrollState = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    if (!isCarousel) return;
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [isCarousel, cards.length]);

  const scrollByCard = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("[data-promo-card]");
    const width = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * width, behavior: "smooth" });
  };

  if (loading) return <PromotionalCardsSkeleton />;
  if (!cards.length) return null;

  const renderCard = (c, i) => {
    const eyebrow = c.badge || c.eyebrow_text || EYEBROWS[i % EYEBROWS.length];
    return (
      <Link
        key={c.card_id}
        to={c.button_link || "/shop"}
        data-promo-card
        className={`group relative overflow-hidden rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1.5 block ${
          isCarousel ? "flex-shrink-0 w-[300px] sm:w-[360px] h-80 snap-start" : "h-72 sm:h-96"
        }`}
      >
        <img
          src={getOptimizedImageUrl(c.image_url, 600)}
          alt={c.title}
          width="400"
          height="400"
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {/* Stronger, richer gradient so text has real contrast, not a flat dim overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/0" />

        {/* Arrow badge — appears on hover for a bit of delight */}
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-md">
          <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6">
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.15em] text-pink-400 mb-2">
            {eyebrow}
          </span>
          <h3 className="text-white text-2xl md:text-[28px] font-extrabold leading-tight mb-1.5">{c.title}</h3>
          {c.subtitle && (
            <p className="text-gray-200 text-sm mb-4 line-clamp-2 max-w-[85%]">{c.subtitle}</p>
          )}
          <span className="inline-flex items-center gap-1.5 text-white text-xs font-bold uppercase tracking-widest border-b-2 border-white/40 group-hover:border-white pb-0.5 transition-colors">
            Shop Now
            <svg
              className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </Link>
    );
  };

  return (
    <SectionWrapper compact>
      <SectionTitle title="Shop by Edit" subtitle="Curated drops and seasonal picks, refreshed regularly." />

      {!isCarousel ? (
        <div
          className={`grid gap-6 ${
            cards.length === 1
              ? "grid-cols-1"
              : cards.length === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-3"
          }`}
        >
          {cards.map(renderCard)}
        </div>
      ) : (
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent z-10" />

          <div
            ref={scrollerRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {cards.map(renderCard)}
          </div>

          {canScrollLeft && (
            <button
              onClick={() => scrollByCard(-1)}
              aria-label="Scroll left"
              className="hidden md:flex items-center justify-center absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-900 hover:text-white transition-colors z-20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scrollByCard(1)}
              aria-label="Scroll right"
              className="hidden md:flex items-center justify-center absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-900 hover:text-white transition-colors z-20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </SectionWrapper>
  );
}