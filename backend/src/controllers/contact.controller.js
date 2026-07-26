import { contactSchema } from "../validators/contact.validator.js";
import { submitContactMessage } from "../services/contactService.js";

export const submitContact = async (req, res) => {
    try {
        const parsed = contactSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: parsed.error.errors[0]?.message || "Invalid contact form data.",
            });
        }

        await submitContactMessage(parsed.data);

        res.status(200).json({
            success: true,
            message: "Your message has been sent. We'll be in touch soon!",
        });
    } catch (err) {
        console.error("Contact form error:", err);
        res.status(500).json({
            success: false,
            message: "Something went wrong sending your message. Please try again.",
        });
    }
};
