import {
  getBrandsService,
  getBrandBySlugService,
  createBrandService,
  updateBrandService,
  deleteBrandService
} from "../services/brand.service.js";

export const getBrands = async (req, res) => {
  try {
    const result = await getBrandsService(req.query);

    return res.status(200).json({
      success: true,
      message: "Brands fetched successfully.",
      data: result.brands,
      pagination: result.pagination
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getBrandBySlug = async (req, res) => {
  try {
    const brand = await getBrandBySlugService(req.params);

    return res.status(200).json({
      success: true,
      message: "Brand fetched successfully.",
      data: brand
    });
  } catch (error) {
    if (error.message === "Brand not found.") {
      return res.status(404).json({ success: false, message: "Brand not found." });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createBrand = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (req.file) body.logo_url = req.file.path;

    const brand = await createBrandService(body);

    return res.status(201).json({
      success: true,
      message: "Brand created successfully.",
      data: brand
    });
  } catch (error) {
    next(error);
  }
};

export const updateBrand = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (req.file) body.logo_url = req.file.path;

    const brand = await updateBrandService(req.params, body);

    return res.status(200).json({
      success: true,
      message: "Brand updated successfully.",
      data: brand
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBrand = async (req, res, next) => {
  try {
    await deleteBrandService(req.params);

    return res.status(200).json({
      success: true,
      message: "Brand deleted successfully."
    });
  } catch (error) {
    next(error);
  }
};