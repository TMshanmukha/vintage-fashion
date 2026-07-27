import {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner
} from "../../models/marketing/banner.model.js";

import cloudinary from "../../config/cloudinary.js";

export async function getAllBannersService() {
  return await getAllBanners();
}

export async function getBannerByIdService(bannerId) {
  const banner = await getBannerById(bannerId);

  if (!banner) {
    throw new Error("Banner not found.");
  }

  return banner;
}

export async function createBannerService(data) {
  const bannerId = await createBanner(data);

  return await getBannerById(bannerId);
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

    return await updateBanner(
        bannerId,
        data
    );
}

export async function deleteBannerService(bannerId) {
  const banner = await getBannerById(bannerId);

  if (!banner) {
    throw new Error("Banner not found.");
  }

  await deleteBanner(bannerId);
}