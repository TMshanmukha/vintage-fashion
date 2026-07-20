import {
  getAllSections,
  updateSectionByName,
} from "../../models/marketing/homepageSection.model.js";

export async function getAllSectionsService() {
  return await getAllSections();
}

export async function updateSectionService(sectionName, is_enabled) {
  await updateSectionByName(sectionName, is_enabled);
  return await getAllSections();
}
