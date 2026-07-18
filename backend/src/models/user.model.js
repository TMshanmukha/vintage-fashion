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
    name,
    email,
    passwordHash,
    phone,
    avatarUrl
}) => {

    console.log("Inside createUser");

    console.log({
        name,
        email,
        passwordHash,
        phone,
        avatarUrl
    });

    const [result] = await pool.query(
        `
        INSERT INTO users
        (
            name,
            email,
            password_hash,
            phone,
            avatar_url
        )
        VALUES
        (
            ?,
            ?,
            ?,
            ?,
            ?
        )
        `,
        [
            name,
            email,
            passwordHash,
            phone,
            avatarUrl
        ]
    );

    return result;
};