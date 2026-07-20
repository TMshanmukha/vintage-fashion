import {
  getAllBannersService,
  getBannerByIdService,
  createBannerService,
  updateBannerService,
  deleteBannerService
} from "../../services/marketing/banner.service.js";

import { bannerSchema } from "../../validators/marketing.validator.js";

export async function updateBanner(req, res, next) {
    try {

        const desktopImage = req.files?.desktop_image?.[0];

        const mobileImage = req.files?.mobile_image?.[0];

        const data = bannerSchema.partial().parse({

            ...req.body,

            ...(desktopImage && {
                desktop_image_url: desktopImage.path,
            }),

            ...(mobileImage && {
                mobile_image_url: mobileImage.path,
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
    const desktopImage = req.files?.desktop_image?.[0];
    const mobileImage = req.files?.mobile_image?.[0];

    const data = bannerSchema.parse({
      ...req.body,

      desktop_image_url: desktopImage?.path,

        desktop_image_public_id: desktopImage?.filename,

        mobile_image_url: mobileImage?.path || null,

        mobile_image_public_id: mobileImage?.filename || null,
    });

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