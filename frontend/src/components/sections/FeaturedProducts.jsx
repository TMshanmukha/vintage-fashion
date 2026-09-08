import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFeaturedProducts } from "../../api/marketingApi";
import ProductCard from "../ui/ProductCard";
import SectionWrapper from "../ui/SectionWrapper";
import { normalizeProduct } from "../../utils/normalizeProduct";

function FeaturedProductsSkeleton() {
  return (
    <SectionWrapper>
      <section className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 md:p-10 animate-pulse">
        {/* Header skeleton — same structure as the real header so nothing
            shifts when real content swaps in */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-8 border-b border-gray-100">
          <div className="flex-1">
            <div className="h-6 w-40 rounded-full bg-gray-100" />
            <div className="mt-4 h-9 w-64 bg-gray-100 rounded" />
            <div className="mt-3 h-4 w-full max-w-2xl bg-gray-100 rounded" />
            <div className="mt-2 h-4 w-2/3 max-w-2xl bg-gray-100 rounded" />
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden sm:block h-10 w-10 bg-gray-100 rounded" />
            <div className="h-11 w-40 bg-gray-100 rounded-full" />
          </div>
        </div>

        {/* Product grid skeleton */}
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[4/5] bg-gray-100 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      </section>
    </SectionWrapper>
  );
}

export default function FeaturedProducts() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        getFeaturedProducts()
            .then((res) => {
                if (mounted) {
                    setItems(res.data?.data || []);
                }
            })
            .catch(() => { })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    if (loading) return <FeaturedProductsSkeleton />;

    // Real fetch finished and there's genuinely nothing featured — hide
    // the section rather than showing an empty shell.
    if (!items.length) return null;

    return (
        <SectionWrapper>
            <section className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 md:p-10">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-8 border-b border-gray-100">

                    <div>
                        <span className="inline-flex items-center rounded-full bg-pink-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-pink-600">
                            ⭐ Editor's Choice
                        </span>

                        <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900">
                            Featured Products
                        </h2>

                        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-gray-500">
                            Discover carefully selected vintage collections loved by our
                            customers. Every piece is chosen for its quality, style and timeless appeal.
                        </p>
                    </div>

                    <div className="flex items-center gap-5">

                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-4xl font-black text-gray-900">
                                {items.length}
                            </span>

                            <span className="text-xs uppercase tracking-[0.18em] text-gray-500">
                                Products
                            </span>
                        </div>

                        <Link
                            to="/shop"
                            className="group inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-pink-600"
                        >
                            View Collection

                            <svg
                                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
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

                    </div>
                </div>

                {/* Products */}
                <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {[...new Map(items.map(item => [item.product_id, item])).values()]
                        .map((item) => (
                            <ProductCard
                                key={item.featured_id || item.product_id}
                                product={normalizeProduct(item)}
                            />
                        ))}
                </div>

            </section>
        </SectionWrapper>
    );
}