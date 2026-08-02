import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFlashSales } from "../../api/marketingApi";
import SectionWrapper from "../ui/SectionWrapper";

function getTimeLeft(endDate) {
  const diff = new Date(endDate).getTime() - Date.now();

  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function FlashSaleBanner() {
  const [sale, setSale] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {

    getFlashSales().then((res) => {
    console.log(res.data.data);
    });
    let mounted = true;

    getFlashSales()
      .then((res) => {
        if (!mounted) return;

        const now = Date.now();

        const active = (res.data?.data || []).find(
          (s) =>
            s.is_active &&
            new Date(s.start_date).getTime() <= now &&
            new Date(s.end_date).getTime() > now &&
            (s.products?.length ?? 0) > 0
        );

        setSale(active || null);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!sale) return;

    setTimeLeft(getTimeLeft(sale.end_date));

    const timer = setInterval(() => {
      const left = getTimeLeft(sale.end_date);
      setTimeLeft(left);

      if (!left) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [sale]);

  if (!sale) return null;

  return (
    <SectionWrapper muted>
      <div
        className="group relative overflow-hidden rounded-2xl shadow-xl min-h-[420px] flex items-center"
        style={{
          backgroundImage: sale.banner_image
            ? `url(${sale.banner_image})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: !sale.banner_image ? "#dc2626" : undefined,
        }}
      >
        {/* Background Zoom */}
        {sale.banner_image && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[7000ms] ease-linear group-hover:scale-110"
            style={{
              backgroundImage: `url(${sale.banner_image})`,
            }}
          />
        )}

        {/* Premium Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />

        {/* Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-red-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-20 left-0 w-72 h-72 bg-pink-500/20 blur-3xl rounded-full" />

        <div className="relative z-10 w-full px-8 md:px-16 py-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">

          {/* Left Content */}
          <div className="max-w-xl">

            <span className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-xs uppercase tracking-[0.2em] font-bold shadow-lg">
              🔥 {sale.badge || "Flash Sale"}
            </span>

            <h2 className="mt-6 text-4xl md:text-5xl font-black text-white leading-tight">
              {sale.title}
            </h2>

            {sale.description && (
              <p className="mt-5 text-white/85 text-lg leading-relaxed">
                {sale.description}
              </p>
            )}

            <Link
              to={sale.button_link || "/shop"}
              className="inline-flex items-center gap-3 mt-8 px-8 py-4 rounded-full bg-white text-gray-900 font-bold transition-all duration-300 hover:bg-gray-900 hover:text-white hover:scale-105"
            >
              {sale.button_text || "Shop Now"}

              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
            <Link
              to={sale.discount_value > 0 ? `/offer/flash-sale/${sale.flash_sale_id}` : (sale.button_link || "/shop")}
              className="inline-flex items-center gap-3 mt-8 px-8 py-4 rounded-full bg-white text-gray-900 font-bold transition-all duration-300 hover:bg-gray-900 hover:text-white hover:scale-105"
            ></Link>
          </div>

          {/* Countdown */}
          {timeLeft && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {[
                ["Days", timeLeft.days],
                ["Hours", timeLeft.hours],
                ["Minutes", timeLeft.minutes],
                ["Seconds", timeLeft.seconds],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="backdrop-blur-xl bg-white/15 border border-white/20 rounded-2xl w-24 h-24 flex flex-col justify-center items-center shadow-lg transition-all duration-300 hover:bg-white/20 hover:-translate-y-1"
                >
                  <div className="text-3xl font-black text-white">
                    {String(value).padStart(2, "0")}
                  </div>

                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/70 mt-1">
                    {label}
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}