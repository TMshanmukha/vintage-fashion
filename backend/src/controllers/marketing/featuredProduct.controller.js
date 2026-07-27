import {
  getAllFeaturedService,
  setFeaturedProductsService,
  removeFeaturedService,
} from "../../services/marketing/featuredProduct.service.js";

import { featuredProductsSchema } from "../../validators/marketing.validator.js";

export async function getFeaturedProducts(req, res, next) {
  try {
    const featured = await getAllFeaturedService();
    return res.status(200).json({ success: true, data: featured });
  } catch (error) {
    next(error);
  }
}

export async function setFeaturedProducts(req, res, next) {
  try {
    const { product_ids } = featuredProductsSchema.parse(req.body);
    const featured = await setFeaturedProductsService(product_ids);

    return res.status(200).json({
      success: true,
      message: "Featured products updated successfully.",
      data: featured,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeFeaturedProduct(req, res, next) {
  try {
    const featured = await removeFeaturedService(Number(req.params.id));
    return res.status(200).json({
      success: true,
      message: "Product removed from featured list.",
      data: featured,
    });
  } catch (error) {
    next(error);
  }
}
