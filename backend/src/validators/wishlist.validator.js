import { z } from "zod";

export const wishlistProductSchema = z.object({
    product_id: z.coerce.number().int().positive()
});
