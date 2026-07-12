import pool from "../config/db.js";

export const getBrandById = async (brandId) => {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM brands
        WHERE brand_id = ?
        AND is_active = TRUE
        LIMIT 1
        `,
        [brandId]
    );

    return rows[0] || null;

};