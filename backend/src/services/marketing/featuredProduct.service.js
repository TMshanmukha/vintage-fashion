import {
  getAllFeatured,
  setFeaturedProducts,
  removeFeatured,
} from "../../models/marketing/featuredProduct.model.js";
import {
  resolvePromotionsForProducts,
  applyPromotion,
} from "../pricing/pricing.service.js";

async function attachPricing(featuredList) {
  if (!featuredList || !featuredList.length) return [];

  const promotions = await resolvePromotionsForProducts(
    featuredList.map((item) => item.product_id)
  );

  return featuredList.map((item) => {
    const promo = promotions[item.product_id];
    const pricing = applyPromotion(item.price, item.original_price, promo);
    return {
      ...item,
      ...pricing,
    };
  });
}

export async function getAllFeaturedService() {
  const featured = await getAllFeatured();
  return attachPricing(featured);
}

export async function setFeaturedProductsService(productIds) {
  await setFeaturedProducts(productIds);
  const featured = await getAllFeatured();
  return attachPricing(featured);
}

export async function removeFeaturedService(featuredId) {
  await removeFeatured(featuredId);
  const featured = await getAllFeatured();
  return attachPricing(featured);
}
