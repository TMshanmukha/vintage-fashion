import * as EmailCenterService from "../services/emailCenterService.js";

// body: { recipientType: "all" | "single", userId, subject, body }
export const sendEmailToUsers = async (req, res) => {
    try {
        const { recipientType, userId, subject, body } = req.body;
        const imageUrl = req.file ? req.file.path : (req.body.imageUrl || req.body.image_url || null);

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
