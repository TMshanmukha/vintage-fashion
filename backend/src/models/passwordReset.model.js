import pool from "../config/db.js";


export const markPasswordResetUsed = async (resetId) => {

    await pool.query(
        `
        UPDATE password_resets
        SET used_at = NOW()
        WHERE reset_id = ?
        `,
        [resetId]
    );

};

export const markResetTokenUsed = async (
    resetId
) => {

    await pool.query(
        `
        UPDATE password_resets
        SET used_at = NOW()
        WHERE reset_id = ?
        `,
        [
            resetId
        ]
    );

};

export const deleteSessionsByUserId = async (
    userId
) => {

    await pool.query(
        `
        DELETE
        FROM user_sessions
        WHERE user_id = ?
        `,
        [
            userId
        ]
    );

};


export const deletePasswordResetsByUserId = async (userId) => {

    await pool.query(
        `
        DELETE FROM password_resets
        WHERE user_id = ?
        `,
        [userId]
    );

};

export const createPasswordReset = async ({
    userId,
    tokenHash,
    expiresAt
}) => {

    const [result] = await pool.query(
        `
        INSERT INTO password_resets
        (
            user_id,
            token_hash,
            expires_at
        )
        VALUES
        (
            ?,
            ?,
            ?
        )
        `,
        [
            userId,
            tokenHash,
            expiresAt
        ]
    );

    return result;

};

export const findPasswordResetById = async (resetId) => {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM password_resets
        WHERE reset_id = ?
        `,
        [resetId]
    );

    return rows[0];

};

export const getActiveResetTokens = async () => {

    const [rows] = await pool.query(
        `
        SELECT *
        FROM password_resets
        WHERE
            used_at IS NULL
            AND expires_at > NOW()
        `
    );

    return rows;

};

export const updatePassword = async (
        userId,
        passwordHash
    ) => {

        await pool.query(
            `
            UPDATE users
            SET password_hash = ?
            WHERE user_id = ?
            `,
            [
                passwordHash,
                userId
            ]
        );
};