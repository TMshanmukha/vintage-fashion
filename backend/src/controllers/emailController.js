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

        const currentUserId = req.user?.userId || req.user?.user_id || null;

        console.log("sendEmailToUsers incoming request:", {
            recipientType,
            userId,
            subject,
            sentBy: currentUserId,
            hasFile: !!req.file,
            hasImageUrl: !!imageUrl,
        });

        if (!subject || !body) {
            return res.status(400).json({ success: false, message: "Subject and body are required." });
        }

        if (recipientType === "all") {
            const count = await EmailCenterService.sendToAllUsers({
                subject: subject.trim(),
                body: body.trim(),
                imageUrl,
                sentBy: currentUserId
            });
            return res.json({ success: true, message: `Email broadcast sent to ${count} users successfully.` });
        }

        const targetUserId = userId || req.body.user_id;
        if (!targetUserId) {
            return res.status(400).json({ success: false, message: "Recipient user ID is required for single emails." });
        }

        const user = await EmailCenterService.sendToSingleUser({
            userId: targetUserId,
            subject: subject.trim(),
            body: body.trim(),
            imageUrl,
            sentBy: currentUserId
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "Recipient user not found." });
        }

        res.json({ success: true, message: `Email sent to ${user.email} successfully.` });

    } catch (err) {
        console.error("sendEmailToUsers controller error:", err);
        res.status(500).json({ success: false, message: err.message || "Failed to send email." });
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
