import pool from "../config/db.js";

export const findUserByEmail = async (email) => {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM users
        WHERE email = ?
        `,
        [email]
    );

    return rows[0];
};

export const findUserById = async (userId) => {

    const [rows] = await pool.query(
        `
        SELECT user_id, name, email, phone, avatar_url, role
        FROM users
        WHERE user_id = ?
        LIMIT 1
        `,
        [userId]
    );

    return rows[0];

};

export const createUser = async ({
    userCode,
    name,
    email,
    passwordHash,
    phone,
    avatarUrl,
    isEmailVerified = 1
}) => {
    const [result] = await pool.query(
        `
        INSERT INTO users
        (
            user_code,
            name,
            email,
            password_hash,
            phone,
            avatar_url,
            is_email_verified
        )
        VALUES
        (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
        )
        `,
        [
            userCode || null,
            name,
            email,
            passwordHash,
            phone || null,
            avatarUrl || null,
            isEmailVerified
        ]
    );

    return result;
};