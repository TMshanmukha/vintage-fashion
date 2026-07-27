import {
  getAllCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
} from "../../models/marketing/promotionalCard.model.js";

import cloudinary from "../../config/cloudinary.js";

export async function getAllCardsService() {
  return await getAllCards();
}

export async function createCardService(data) {
  const cardId = await createCard(data);
  return await getCardById(cardId);
}

export async function updateCardService(cardId, data) {
  const card = await getCardById(cardId);
  if (!card) throw new Error("Promotional card not found.");

  // Delete old image from Cloudinary if a new one replaced it
  if (data.image_public_id && card.image_public_id) {
    await cloudinary.uploader.destroy(card.image_public_id);
  }

  return await updateCard(cardId, data);
}

export async function deleteCardService(cardId) {
  const card = await getCardById(cardId);
  if (!card) throw new Error("Promotional card not found.");

  if (card.image_public_id) {
    await cloudinary.uploader.destroy(card.image_public_id);
  }

  await deleteCard(cardId);
}
