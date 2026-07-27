import pool from "../config/db.js";

export const getWebsiteSettings = async () => {

    const [rows] = await pool.query(
        `SELECT * FROM website_settings WHERE setting_id = 1`
    );

    return rows[0] || null;

};
