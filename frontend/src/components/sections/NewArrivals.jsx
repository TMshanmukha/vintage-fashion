import { useEffect, useState } from "react";
import { getProducts } from "../../api/productApi";
import { normalizeProduct } from "../../utils/normalizeProduct";
import ProductCard from "../ui/ProductCard";
import SectionTitle from "../ui/SectionTitle";
import SectionWrapper from "../ui/SectionWrapper";

function NewArrivalsSkeleton() {
  return (
    <SectionWrapper muted>
      <SectionTitle
        title="✨ New Arrival"
        subtitle="Discover the latest collection and find your perfect look today."
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/5] bg-gray-200/60 rounded-md mb-3" />
            <div className="h-4 bg-gray-200/60 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200/60 rounded w-1/3" />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getProducts({ page: 1, limit: 10, sort: "newest" })
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        setProducts(list);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <NewArrivalsSkeleton />;
  if (!products.length) return null;

  return (
    <SectionWrapper muted>
      <SectionTitle
        title="✨ New Arrival"
        subtitle="Discover the latest collection and find your perfect look today."
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {products.map((product) => (
          <ProductCard key={product.product_id ?? product.id} product={normalizeProduct(product, { badge: "New" })} />
        ))}
      </div>
    </SectionWrapper>
  );
}