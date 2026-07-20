import {
  getAllFlashSalesService,
  getFlashSaleByIdService,
  createFlashSaleService,
  updateFlashSaleService,
  deleteFlashSaleService,
  setFlashSaleProductsService,
} from "../../services/marketing/flashSale.service.js";

import {
  flashSaleSchema,
  flashSaleProductsSchema,
} from "../../validators/marketing.validator.js";

export async function getAllFlashSales(req, res, next) {
  try {
    const sales = await getAllFlashSalesService();
    return res.status(200).json({ success: true, data: sales });
  } catch (error) {
    next(error);
  }
}

export async function getFlashSale(req, res, next) {
  try {
    const sale = await getFlashSaleByIdService(Number(req.params.id));
    return res.status(200).json({ success: true, data: sale });
  } catch (error) {
    next(error);
  }
}

export async function createFlashSale(req, res, next) {
  try {
    const bannerImage = req.file;

    const data = flashSaleSchema.parse({
      ...req.body,

      start_date: req.body.start_date
        ? req.body.start_date.replace("T", " ") + ":00"
        : undefined,

      end_date: req.body.end_date
        ? req.body.end_date.replace("T", " ") + ":00"
        : undefined,

      ...(bannerImage && { banner_image: bannerImage.path }),
    });

    const sale = await createFlashSaleService(data);

    return res.status(201).json({
      success: true,
      message: "Flash sale created successfully.",
      data: sale,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateFlashSale(req, res, next) {
  try {
    const bannerImage = req.file;

    const data = flashSaleSchema.partial().parse({
      ...req.body,

      ...(req.body.start_date && {
        start_date: req.body.start_date.replace("T", " ") + ":00",
      }),

      ...(req.body.end_date && {
        end_date: req.body.end_date.replace("T", " ") + ":00",
      }),

      ...(bannerImage && { banner_image: bannerImage.path }),
    });
    
    const sale = await updateFlashSaleService(Number(req.params.id), data);

    return res.status(200).json({
      success: true,
      message: "Flash sale updated successfully.",
      data: sale,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteFlashSale(req, res, next) {
  try {
    await deleteFlashSaleService(Number(req.params.id));
    return res.status(200).json({
      success: true,
      message: "Flash sale deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

export async function setFlashSaleProducts(req, res, next) {
  try {
    const { product_ids } = flashSaleProductsSchema.parse(req.body);

    const sale = await setFlashSaleProductsService(
      Number(req.params.id),
      product_ids
    );

    return res.status(200).json({
      success: true,
      message: "Flash sale products updated successfully.",
      data: sale,
    });
  } catch (error) {
    next(error);
  }
}
