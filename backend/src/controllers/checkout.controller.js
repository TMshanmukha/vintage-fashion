import {
    initiateCheckoutService,
    verifyPaymentService
} from "../services/checkout.service.js";

export const initiateCheckout = async (req, res, next) => {

    try {

        const result = await initiateCheckoutService(req.user.userId, req.body);

        return res.status(201).json({
            success: true,
            message: "Checkout initiated.",
            data: result
        });

    } catch (error) {

        next(error);

    }

};

export const verifyPayment = async (req, res, next) => {

    try {

        const result = await verifyPaymentService(req.user.userId, req.body);

        return res.status(200).json({
            success: true,
            message: "Payment verified.",
            data: result
        });

    } catch (error) {

        next(error);

    }

};
