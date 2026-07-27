import { z } from "zod";

export const addressSchema = z.object({
    label: z.string().trim().max(50).optional().nullable(),
    address_line1: z.string().trim().min(3).max(255),
    address_line2: z.string().trim().max(255).optional().nullable(),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(1).max(100),
    pincode: z.string().trim().min(4).max(10),
    country: z.string().trim().default("India"),
    is_default: z.coerce.boolean().optional().default(false)
});
