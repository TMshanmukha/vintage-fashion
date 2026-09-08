import {
    getOrCreateCart,
    upsertCartItem,
    setCartItemQuantity,
    deleteCartItem,
    getCartItems,
    getVariantById
} from "../models/cart.model.js";

import {
    addCartItemSchema,
    updateCartItemSchema
} from "../validators/cart.validator.js";

import { resolvePromotionForProduct, applyPromotion } from "../services/pricing/pricing.service.js";


export const getCartService = async (userId) => {
    const cartId = await getOrCreateCart(userId);
    return await getCartItems(cartId);
};

export const addCartItemService = async (userId, body) => {
  const { variant_id, quantity } = addCartItemSchema.parse(body);
  const variant = await getVariantById(variant_id);
  if (!variant) throw new Error("Product variant not found.");
  if (variant.stock_quantity < quantity) throw new Error("Not enough stock for this selection.");

  const basePrice = Number(variant.price); // your existing (product.price + variant.price_modifier) value
  const promotion = await resolvePromotionForProduct(variant.product_id);
  const pricing = applyPromotion(basePrice, variant.original_price, promotion);

  const cartId = await getOrCreateCart(userId);
  await upsertCartItem(cartId, variant_id, quantity, pricing); // model needs the extra param
  return await getCartItems(cartId);
};

export const updateCartItemService = async (userId, params, body) => {

    const cartItemId = Number(params.cartItemId);
    const { quantity } = updateCartItemSchema.parse(body);

    const cartId = await getOrCreateCart(userId);

    const result = await setCartItemQuantity(cartItemId, cartId, quantity);

    if (result.affectedRows === 0) {
        throw new Error("Cart item not found.");
    }

    return await getCartItems(cartId);

};

export const removeCartItemService = async (userId, params) => {

    const cartItemId = Number(params.cartItemId);

    const cartId = await getOrCreateCart(userId);

    await deleteCartItem(cartItemId, cartId);

    return await getCartItems(cartId);

};

