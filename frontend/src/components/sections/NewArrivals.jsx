import { useSiteData } from "../../hooks/useSiteData";
import ProductCard from "../ui/ProductCard";
import SectionTitle from "../ui/SectionTitle";

export default function NewArrivals() {
  const { products, siteText } = useSiteData();

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        <SectionTitle
          title="✨ New Arrival"
          subtitle={siteText.newArrivalSubtitle}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
