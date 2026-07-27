import {
  getAllSections,
  updateSectionByName,
} from "../../models/marketing/homepageSection.model.js";

import * as NotificationService from "../notificationService.js";

export async function getAllSectionsService() {
  return await getAllSections();
}

export async function updateSectionService(sectionName, is_enabled) {
  await updateSectionByName(sectionName, is_enabled);

  await NotificationService.createNotification({
      title: "Homepage Updated",
      body: "Homepage content was updated.",
      type: "content"
  });

  return await getAllSections();
}
