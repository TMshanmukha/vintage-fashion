import {
  getAllCardsService,
  getCardByIdService,
  createCardService,
  updateCardService,
  deleteCardService,
  setCardProductsService,
} from "../../services/marketing/promotionalCard.service.js";

import {
  promotionalCardSchema,
  cardProductsSchema,
} from "../../validators/marketing.validator.js";

export async function getAllCards(req, res, next) {
  try {
    const cards = await getAllCardsService();
    return res.status(200).json({ success: true, data: cards });
  } catch (error) {
    next(error);
  }
}

export async function getCard(req, res, next) {
  try {
    const card = await getCardByIdService(Number(req.params.id));
    if (!card) {
      return res.status(404).json({ success: false, message: "Card not found." });
    }
    return res.status(200).json({ success: true, data: card });
  } catch (error) {
    next(error);
  }
}

export async function createCard(req, res, next) {
  try {
    const image = req.file;

    const data = promotionalCardSchema.parse({
      ...req.body,
      image_url: image?.path,
      image_public_id: image?.filename,
    });

    const card = await createCardService(data);

    return res.status(201).json({
      success: true,
      message: "Promotional card created successfully.",
      data: card,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCard(req, res, next) {
  try {
    const image = req.file;

    const data = promotionalCardSchema.partial().parse({
      ...req.body,
      ...(image && {
        image_url: image.path,
        image_public_id: image.filename,
      }),
    });

    const card = await updateCardService(Number(req.params.id), data);

    return res.status(200).json({
      success: true,
      message: "Promotional card updated successfully.",
      data: card,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCard(req, res, next) {
  try {
    await deleteCardService(Number(req.params.id));
    return res.status(200).json({
      success: true,
      message: "Promotional card deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
}

export async function setCardProducts(req, res, next) {
  try {
    const { product_ids } = cardProductsSchema.parse(req.body);
    const card = await setCardProductsService(Number(req.params.id), product_ids);

    return res.status(200).json({
      success: true,
      message: "Promotional card products updated successfully.",
      data: card,
    });
  } catch (error) {
    next(error);
  }
}