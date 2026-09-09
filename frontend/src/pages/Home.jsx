import Hero from "../components/sections/Hero";
import FeaturesBar from "../components/sections/FeaturesBar";
import PromotionalCards from "../components/sections/PromotionalCards";
import FlashSaleBanner from "../components/sections/FlashSaleBanner";
import FeaturedProducts from "../components/sections/FeaturedProducts";
import NewArrivals from "../components/sections/NewArrivals";
import { useHomepageSections } from "../hooks/useHomepageSections";
import { SECTION_NAMES } from "../constants/homepageSections";

export default function Home() {
  const { isEnabled } = useHomepageSections();

  return (
    <>
      {isEnabled(SECTION_NAMES.HERO_BANNER) && <Hero />}
      <FeaturesBar />
      {isEnabled(SECTION_NAMES.PROMOTIONAL_CARDS) && <PromotionalCards />}
      {isEnabled(SECTION_NAMES.FLASH_SALE) && <FlashSaleBanner />}
      {isEnabled(SECTION_NAMES.FEATURED_PRODUCTS) && <FeaturedProducts />}
      {isEnabled(SECTION_NAMES.NEW_ARRIVALS) && <NewArrivals />}
    </>
  );
}