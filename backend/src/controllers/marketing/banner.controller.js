import {
  getAllBannersService,
  getBannerByIdService,
  createBannerService,
  updateBannerService,
  deleteBannerService,
  setBannerProductsService,
} from "../../services/marketing/banner.service.js";

import { bannerSchema, bannerProductsSchema } from "../../validators/marketing.validator.js";

export async function updateBanner(req, res, next) {
    try {

        const desktopImage = req.files?.desktop_image?.[0] || null;
        const mobileImage = req.files?.mobile_image?.[0] || null;

        const data = bannerSchema.partial().parse({

            ...req.body,

            ...(desktopImage && {
                desktop_image_url: desktopImage.path,
                desktop_image_public_id: desktopImage.filename,
            }),

            ...(mobileImage && {
                mobile_image_url: mobileImage.path,
                mobile_image_public_id: mobileImage.filename,
            }),

        });

        const banner = await updateBannerService(
            Number(req.params.id),
            data
        );

        return res.status(200).json({
            success: true,
            message: "Banner updated successfully.",
            data: banner,
        });

    } catch (error) {
        next(error);
    }
}

export async function deleteBanner(req, res, next) {
  try {
    await deleteBannerService(Number(req.params.id));

    res.json({
      success: true,
      message: "Banner deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllBanners(req, res, next) {
  try {
    const banners = await getAllBannersService();

    return res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBanner(req, res, next) {
  try {
    const banner = await getBannerByIdService(req.params.id);

    return res.status(200).json({
      success: true,
      data: banner,
    });
  } catch (error) {
    next(error);
  }
}

export async function createBanner(req, res, next) {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    const desktopImage = req.files?.desktop_image?.[0];
    const mobileImage = req.files?.mobile_image?.[0];

    const data = bannerSchema.parse({
      ...req.body,
      desktop_image_url: desktopImage?.path || null,
      desktop_image_public_id: desktopImage?.filename || null,
      mobile_image_url: mobileImage?.path || null,
      mobile_image_public_id: mobileImage?.filename || null,
    });

    console.log("PARSED DATA:", data);

    const banner = await createBannerService(data);

    return res.status(201).json({
      success: true,
      message: "Banner created successfully.",
      data: banner,
    });
  } catch (error) {
    next(error);
  }
}

export async function setBannerProducts(req, res, next) {
  try {
    const { product_ids } = bannerProductsSchema.parse(req.body);
    const banner = await setBannerProductsService(Number(req.params.id), product_ids);

    return res.status(200).json({
      success: true,
      message: "Banner products updated successfully.",
      data: banner,
    });
  } catch (error) {
    next(error);
  }
}
