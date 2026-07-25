import {
    getCartService,
    addCartItemService,
    updateCartItemService,
    removeCartItemService
} from "../services/cart.service.js";

export const getCart = async (req, res, next) => {

    try {
        console.log("Inside getCart controller");
    console.log(req.user);

        const items = await getCartService(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Cart fetched successfully.",
            data: items
        });

    } catch (error) {

        next(error);

    }

};

export const addCartItem = async (req, res, next) => {

    try {

        const items = await addCartItemService(req.user.userId, req.body);

        return res.status(201).json({
            success: true,
            message: "Added to cart.",
            data: items
        });

    } catch (error) {

        next(error);

    }

};

export const updateCartItem = async (req, res, next) => {

    try {

        const items = await updateCartItemService(
            req.user.userId,
            req.params,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Cart updated.",
            data: items
        });

    } catch (error) {

        next(error);

    }

};

export const removeCartItem = async (req, res, next) => {

    try {

        const items = await removeCartItemService(req.user.userId, req.params);

        return res.status(200).json({
            success: true,
            message: "Removed from cart.",
            data: items
        });

    } catch (error) {

        next(error);

    }

};
