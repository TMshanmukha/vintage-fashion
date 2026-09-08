import {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  getBannerProducts,
  setBannerProducts,
} from "../../models/marketing/banner.model.js";
import {
  resolvePromotionsForProducts,
  applyPromotion,
} from "../pricing/pricing.service.js";
import cloudinary from "../../config/cloudinary.js";

async function attachProducts(banner) {
  if (!banner) return banner;
  const products = await getBannerProducts(banner.banner_id);
  if (!products || !products.length) return { ...banner, products: [] };

  const promotions = await resolvePromotionsForProducts(
    products.map((p) => p.product_id)
  );

  const formattedProducts = products.map((p) => {
    let promo = promotions[p.product_id];
    if (!promo && banner.discount_percent && Number(banner.discount_percent) > 0) {
      promo = {
        discount_type: "PERCENTAGE",
        discount_value: Number(banner.discount_percent),
      };
    }
    const pricing = applyPromotion(p.price, p.original_price, promo);
    return {
      ...p,
      ...pricing,
    };
  });

  return { ...banner, products: formattedProducts };
}

export async function getAllBannersService() {
  const banners = await getAllBanners();
  return Promise.all(banners.map(attachProducts));
}

export async function getBannerByIdService(bannerId) {
  const banner = await getBannerById(bannerId);

  if (!banner) {
    throw new Error("Banner not found.");
  }

  return attachProducts(banner);
}

export async function createBannerService(data) {
  const bannerId = await createBanner(data);

  return attachProducts(await getBannerById(bannerId));
}

export async function updateBannerService(bannerId, data) {

    const banner = await getBannerById(bannerId);

    if (!banner) {
        throw new Error("Banner not found.");
    }

    // Delete old desktop image
    if (
        data.desktop_image_public_id &&
        banner.desktop_image_public_id
    ) {
        await cloudinary.uploader.destroy(
            banner.desktop_image_public_id
        );
    }

    // Delete old mobile image
    if (
        data.mobile_image_public_id &&
        banner.mobile_image_public_id
    ) {
        await cloudinary.uploader.destroy(
            banner.mobile_image_public_id
        );
    }

    const updated = await updateBanner(bannerId, data);
    return attachProducts(updated);
}

export async function deleteBannerService(bannerId) {
  const banner = await getBannerById(bannerId);

  if (!banner) {
    throw new Error("Banner not found.");
  }

  await deleteBanner(bannerId);
}

export async function setBannerProductsService(bannerId, productIds) {
  const banner = await getBannerById(bannerId);

  if (!banner) {
    throw new Error("Banner not found.");
  }

  await setBannerProducts(bannerId, productIds);
  return attachProducts(await getBannerById(bannerId));
}