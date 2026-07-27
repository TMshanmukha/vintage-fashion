import {
    getWishlistService,
    addWishlistService,
    removeWishlistService
} from "../services/wishlist.service.js";

export const getWishlist = async (req, res, next) => {

    try {

        const items = await getWishlistService(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Wishlist fetched successfully.",
            data: items
        });

    } catch (error) {

        next(error);

    }

};

export const addWishlist = async (req, res, next) => {

    try {

        const result = await addWishlistService(req.user.userId, req.body);

        return res.status(201).json({
            success: true,
            message: "Added to wishlist.",
            data: result
        });

    } catch (error) {

        next(error);

    }

};

export const removeWishlist = async (req, res, next) => {

    try {

        await removeWishlistService(req.user.userId, req.params);

        return res.status(200).json({
            success: true,
            message: "Removed from wishlist."
        });

    } catch (error) {

        next(error);

    }

};
