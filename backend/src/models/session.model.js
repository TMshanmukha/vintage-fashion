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
