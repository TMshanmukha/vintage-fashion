import { z } from "zod";

export const initiateCheckoutSchema = z.object({
    address_id: z.coerce.number().int().positive()
});

export const verifyPaymentSchema = z.object({
    order_id: z.coerce.number().int().positive(),
    razorpay_order_id: z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature: z.string().min(1)
});
