import { useEffect, useState } from "react";
import { getFeaturedProducts } from "../../api/marketingApi";
import ProductCard from "../ui/ProductCard";
import SectionTitle from "../ui/SectionTitle";
import SectionWrapper from "../ui/SectionWrapper";

export default function FeaturedProducts() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    getFeaturedProducts()
      .then((res) => mounted && setItems(res.data?.data || []))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  if (!items.length) return null;

  return (
    <SectionWrapper>
      <SectionTitle title="⭐ Featured products" subtitle="Hand-picked pieces our team loves right now." />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {items.map((item) => (
          <ProductCard
            key={item.featured_id}
            product={{
              id: item.product_id,
              name: item.product_name,
              slug: item.slug,
              price: item.price,
              image: item.image_url,
              images: item.image_url ? [item.image_url] : [],
            }}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}