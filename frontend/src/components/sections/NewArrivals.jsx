import { useEffect, useState } from "react";
import { getProducts } from "../../api/productApi";
import { normalizeProduct } from "../../utils/normalizeProduct";
import ProductCard from "../ui/ProductCard";
import SectionTitle from "../ui/SectionTitle";
import SectionWrapper from "../ui/SectionWrapper";

export default function NewArrivals() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let mounted = true;
    getProducts({ page: 1, limit: 10 })
      .then((res) => mounted && setProducts(res.data?.data || []))
      .catch(() => { });
    return () => {
      mounted = false;
    };
  }, []);

  if (!products.length) return null;

  return (
    <SectionWrapper>
      <section className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        <SectionTitle
          title="✨ New Arrival"
          subtitle="Discover the latest collection and find your perfect look today."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard key={product.product_id ?? product.id} product={normalizeProduct(product, { badge: "New" })} />
          ))}
        </div>
      </div>
    </section>
    </SectionWrapper>
    
  );
}