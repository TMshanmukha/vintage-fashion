import * as EmailCenterService from "../services/emailCenterService.js";

// body: { recipientType: "all" | "single", userId, subject, body }
export const sendEmailToUsers = async (req, res) => {
    try {
        const { recipientType, userId, subject, body } = req.body;
        let imageUrl = null;
        if (req.file) {
            imageUrl = req.file.secure_url || req.file.path || req.file.url;
        } else {
            imageUrl = req.body.imageUrl || req.body.image_url || req.body.bannerUrl || req.body.image || null;
        }

        if (imageUrl && typeof imageUrl === "string") {
            imageUrl = imageUrl.trim();
            if (imageUrl.startsWith("http://")) {
                imageUrl = imageUrl.replace("http://", "https://");
            }
        } else {
            imageUrl = null;
        }

        console.log("sendEmailToUsers payload:", {
            recipientType,
            userId,
            subject,
            hasFile: !!req.file,
            hasImageUrl: !!imageUrl,
            imageUrl: imageUrl ? imageUrl.substring(0, 60) + "..." : null
        });

        if (!subject || !body) {
            return res.status(400).json({ message: "Subject and body are required." });
        }

        if (recipientType === "all") {
            const count = await EmailCenterService.sendToAllUsers({
                subject,
                body,
                imageUrl,
                sentBy: req.user?.user_id
            });
            return res.json({ message: `Email sent to ${count} users.` });
        }

        const user = await EmailCenterService.sendToSingleUser({
            userId,
            subject,
            body,
            imageUrl,
            sentBy: req.user?.user_id
        });
        if (!user) return res.status(404).json({ message: "User not found." });

        res.json({ message: `Email sent to ${user.email}.` });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to send email." });
    }
};

export const listEmailLog = async (req, res) => {
    try {
        const emails = await EmailCenterService.listEmailLog();
        res.json({ emails });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch email log." });
    }
};
