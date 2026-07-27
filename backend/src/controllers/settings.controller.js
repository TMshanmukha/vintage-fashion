import { getWebsiteSettings } from "../models/settings.model.js";

export const getSettings = async (req, res, next) => {

    try {

        const settings = await getWebsiteSettings();

        return res.status(200).json({
            success: true,
            message: "Settings fetched successfully.",
            data: settings
        });

    } catch (error) {

        next(error);

    }

};
