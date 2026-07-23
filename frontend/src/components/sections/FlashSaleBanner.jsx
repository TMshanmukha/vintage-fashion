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
            .catch(() => { });
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
            <section className="py-14">
            <div className="max-w-7xl mx-auto px-6">
                <div
                    className="relative rounded-sm overflow-hidden text-white p-10 md:p-14 bg-cover bg-center min-h-[320px] flex flex-col justify-center"
                    style={{
                        backgroundImage: sale.banner_image ? `url(${sale.banner_image})` : undefined,
                        background: !sale.banner_image
                            ? "linear-gradient(to right,#dc2626,#db2777,#ea580c)"
                            : undefined,
                    }}
                >
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative z-10 max-w-lg">
                        {sale.badge && (
                            <span className="inline-block bg-white text-red-600 text-xs font-bold px-3 py-1 rounded-full mb-4">
                                {sale.badge}
                            </span>
                        )}
                        <h2 className="text-3xl md:text-4xl font-extrabold">{sale.title}</h2>
                        {sale.description && <p className="mt-3 text-white/90">{sale.description}</p>}

                        {timeLeft && (
                            <div className="flex gap-3 mt-6">
                                {[
                                    ["Days", timeLeft.days],
                                    ["Hrs", timeLeft.hours],
                                    ["Min", timeLeft.minutes],
                                    ["Sec", timeLeft.seconds],
                                ].map(([label, value]) => (
                                    <div key={label} className="bg-white/95 text-gray-900 rounded-sm w-16 py-2 text-center">
                                        <div className="text-xl font-bold leading-none">{String(value).padStart(2, "0")}</div>
                                        <div className="text-[10px] uppercase tracking-wide text-gray-500 mt-1">{label}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Link
                            to={sale.button_link || "/shop"}
                            className="inline-block mt-8 bg-white text-red-600 px-7 py-3 rounded-full font-semibold"
                        >
                            {sale.button_text || "Shop Now"}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
        </SectionWrapper>
        
    );
}