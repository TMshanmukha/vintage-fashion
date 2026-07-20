import {
  getAllSectionsService,
  updateSectionService,
} from "../../services/marketing/homepageSection.service.js";

export async function getAllSections(req, res, next) {
  try {
    const sections = await getAllSectionsService();
    return res.status(200).json({ success: true, data: sections });
  } catch (error) {
    next(error);
  }
}

export async function updateSection(req, res, next) {
  try {
    const { is_enabled } = req.body;

    const sections = await updateSectionService(
      req.params.name,
      Boolean(is_enabled)
    );

    return res.status(200).json({
      success: true,
      message: "Section updated successfully.",
      data: sections,
    });
  } catch (error) {
    next(error);
  }
}
