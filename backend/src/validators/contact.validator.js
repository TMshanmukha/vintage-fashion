import { z } from "zod";

export const contactSchema = z.object({
    name: z.string().trim().min(2, "Name is too short").max(100),
    email: z.string().trim().email("Enter a valid email address"),
    subject: z.string().trim().max(150).optional().default(""),
    message: z.string().trim().min(5, "Message is too short").max(2000),
});
