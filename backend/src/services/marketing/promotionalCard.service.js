import {
  getAllCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  getCardProducts,
  setCardProducts,
} from "../../models/marketing/promotionalCard.model.js";

import cloudinary from "../../config/cloudinary.js";

export async function getAllCardsService() {
  const cards = await getAllCards();
  return Promise.all(
    cards.map(async (card) => ({
      ...card,
      products: await getCardProducts(card.card_id),
    }))
  );
}

export async function getCardByIdService(cardId) {
  const card = await getCardById(cardId);
  if (!card) return null;
  const products = await getCardProducts(cardId);
  return { ...card, products };
}

export async function createCardService(data) {
  const cardId = await createCard(data);
  return await getCardByIdService(cardId);
}

export async function updateCardService(cardId, data) {
  const card = await getCardById(cardId);
  if (!card) throw new Error("Promotional card not found.");

  if (data.image_public_id && card.image_public_id) {
    await cloudinary.uploader.destroy(card.image_public_id);
  }

  await updateCard(cardId, data);
  return await getCardByIdService(cardId);
}

export async function deleteCardService(cardId) {
  const card = await getCardById(cardId);
  if (!card) throw new Error("Promotional card not found.");

  if (card.image_public_id) {
    await cloudinary.uploader.destroy(card.image_public_id);
  }

  await deleteCard(cardId);
}

export async function setCardProductsService(cardId, productIds) {
  const card = await getCardById(cardId);
  if (!card) throw new Error("Promotional card not found.");

  await setCardProducts(cardId, productIds);
  return await getCardByIdService(cardId);
}