import pool from "../config/db.js";

export const logEmail = async ({
    recipientType,
    recipientEmail = null,
    recipientLabel = null,
    subject,
    body,
    sentBy = null
}) => {

    const [result] = await pool.query(
        `
        INSERT INTO email_logs
        (recipient_type, recipient_email, recipient_label, subject, body, sent_by)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [recipientType, recipientEmail, recipientLabel, subject, body, sentBy]
    );

    return result.insertId;
};

export const getEmailLog = async (limit = 100) => {

    const [rows] = await pool.query(
        `
        SELECT email_id, recipient_type, recipient_email, recipient_label, subject, body, sent_at
        FROM email_logs
        ORDER BY sent_at DESC
        LIMIT ?
        `,
        [limit]
    );

    return rows;
};
