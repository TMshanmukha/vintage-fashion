import { z } from "zod";

export const addCartItemSchema = z.object({
    variant_id: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive().default(1)
});

export const updateCartItemSchema = z.object({
    quantity: z.coerce.number().int().positive()
});
