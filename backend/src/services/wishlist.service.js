import {
    addToWishlist,
    removeFromWishlistDb,
    getWishlistByUser
} from "../models/wishlist.model.js";

import { wishlistProductSchema } from "../validators/wishlist.validator.js";

export const getWishlistService = async (userId) => {
    return await getWishlistByUser(userId);
};

export const addWishlistService = async (userId, body) => {

    const { product_id } = wishlistProductSchema.parse(body);

    await addToWishlist(userId, product_id);

    return { product_id };

};

export const removeWishlistService = async (userId, params) => {

    const { product_id } = wishlistProductSchema.parse({
        product_id: params.productId
    });

    await removeFromWishlistDb(userId, product_id);

};
