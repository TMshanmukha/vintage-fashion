import {
  getAllCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  getCardProducts,
  setCardProducts,
} from "../../models/marketing/promotionalCard.model.js";
import {
  resolvePromotionsForProducts,
  applyPromotion,
} from "../pricing/pricing.service.js";
import cloudinary from "../../config/cloudinary.js";

async function attachProducts(card) {
  if (!card) return card;
  const products = await getCardProducts(card.card_id);
  if (!products || !products.length) return { ...card, products: [] };

  const promotions = await resolvePromotionsForProducts(
    products.map((p) => p.product_id)
  );

  const formattedProducts = products.map((p) => {
    const promo = promotions[p.product_id];
    const pricing = applyPromotion(p.price, p.original_price, promo);
    return {
      ...p,
      ...pricing,
    };
  });

  return { ...card, products: formattedProducts };
}

export async function getAllCardsService() {
  const cards = await getAllCards();
  return Promise.all(cards.map(attachProducts));
}

export async function getCardByIdService(cardId) {
  const card = await getCardById(cardId);
  if (!card) return null;
  return attachProducts(card);
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