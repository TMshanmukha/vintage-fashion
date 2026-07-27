import {
  getAllFeatured,
  setFeaturedProducts,
  removeFeatured,
} from "../../models/marketing/featuredProduct.model.js";

export async function getAllFeaturedService() {
  return await getAllFeatured();
}

export async function setFeaturedProductsService(productIds) {
  await setFeaturedProducts(productIds);
  return await getAllFeatured();
}

export async function removeFeaturedService(featuredId) {
  await removeFeatured(featuredId);
  return await getAllFeatured();
}
