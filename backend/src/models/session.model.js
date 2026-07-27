import pool from "../config/db.js";

export const createSession = async ({
    session_id,
    userId,
    refreshTokenHash,
    userAgent,
    ipAddress,
    expiresAt
}) => {

    const [result] = await pool.query(
        `
        INSERT INTO user_sessions
        (
            session_id,
            user_id,
            refresh_token_hash,
            user_agent,
            ip_address,
            expires_at
        )
        VALUES
        (?, ?, ?, ?, ?, ?)
        `,
        [
            session_id,
            userId,
            refreshTokenHash,
            userAgent,
            ipAddress,
            expiresAt
        ]
    );

    return result;
};

export const deleteSession = async (sessionId) => {

    await pool.query(
        `
        DELETE FROM user_sessions
        WHERE session_id = ?
        `,
        [sessionId]
    );

};

export const getSessionById = async (sessionId) => {

    const [rows] = await pool.query(
        `
        SELECT
            session_id,
            user_id,
            refresh_token_hash,
            expires_at
        FROM user_sessions
        WHERE session_id = ?
        `,
        [sessionId]
    );

    return rows[0];

};

export const updateSessionRefreshToken = async (sessionId, refreshTokenHash, expiresAt) => {

    await pool.query(
        `
        UPDATE user_sessions
        SET
            refresh_token_hash = ?,
            expires_at = ?
        WHERE session_id = ?
        `,
        [refreshTokenHash, expiresAt, sessionId]
    );

};