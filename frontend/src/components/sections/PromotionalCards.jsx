import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCards } from "../../api/marketingApi";
import SectionWrapper from "../ui/SectionWrapper";

export default function PromotionalCards() {
    const [cards, setCards] = useState([]);

    useEffect(() => {
        let mounted = true;
        getCards()
            .then((res) => mounted && setCards((res.data?.data || []).filter((c) => c.is_active)))
            .catch(() => { });
        return () => {
            mounted = false;
        };
    }, []);

    if (!cards.length) return null;

    return (
        <SectionWrapper>
            <section className="py-14">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card) => (
                        <Link
                            key={card.card_id}
                            to={card.button_link || "/shop"}
                            className="group relative h-64 overflow-hidden rounded-sm block"
                        >
                            <img
                                src={card.image_url}
                                alt={card.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors" />
                            <div className="absolute inset-0 flex flex-col items-start justify-end p-6">
                                <h3 className="text-white text-2xl font-bold">{card.title}</h3>
                                {card.subtitle && <p className="text-gray-200 text-sm mt-1">{card.subtitle}</p>}
                                <span className="mt-4 inline-block border border-white text-white text-xs font-bold uppercase tracking-widest px-5 py-2 group-hover:bg-white group-hover:text-gray-900 transition-all">
                                    Shop Now
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
        </SectionWrapper>
        
    );
}