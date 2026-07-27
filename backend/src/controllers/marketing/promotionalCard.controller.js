import {
  getAllCardsService,
  createCardService,
  updateCardService,
  deleteCardService,
} from "../../services/marketing/promotionalCard.service.js";

import { promotionalCardSchema } from "../../validators/marketing.validator.js";

export async function getAllCards(req, res, next) {
  try {
    const cards = await getAllCardsService();
    return res.status(200).json({ success: true, data: cards });
  } catch (error) {
    next(error);
  }
}

export async function createCard(req, res, next) {
  try {
    const image = req.file;
    console.log(req.body);

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
