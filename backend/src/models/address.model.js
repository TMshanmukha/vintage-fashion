import pool from "../config/db.js";

export const createAddress = async (userId, data) => {

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        if (data.is_default) {

            await connection.query(
                `UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?`,
                [userId]
            );

        }

        const [result] = await connection.query(
            `
            INSERT INTO user_addresses
                (user_id, label, address_line1, address_line2, city, state, pincode, country, is_default)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                userId,
                data.label ?? null,
                data.address_line1,
                data.address_line2 ?? null,
                data.city,
                data.state,
                data.pincode,
                data.country,
                data.is_default
            ]
        );

        await connection.commit();

        return result.insertId;

    } catch (error) {

        await connection.rollback();
        throw error;

    } finally {

        connection.release();

    }

};

export const getAddressesByUser = async (userId) => {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM user_addresses
        WHERE user_id = ?
        ORDER BY is_default DESC, created_at DESC
        `,
        [userId]
    );

    return rows;

};

export const getAddressById = async (userId, addressId) => {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM user_addresses
        WHERE address_id = ? AND user_id = ?
        `,
        [addressId, userId]
    );

    return rows[0];

};
