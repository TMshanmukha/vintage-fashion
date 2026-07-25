import pool from "../config/db.js";

export const createPayment = async (connection, payment) => {

    const [result] = await connection.query(
        `
        INSERT INTO payments
            (order_id, payment_method, payment_gateway, transaction_id, amount, payment_status)
        VALUES (?, 'UPI', 'razorpay', ?, ?, 'pending')
        `,
        [payment.order_id, payment.transaction_id, payment.amount]
    );

    return result.insertId;

};

export const updatePaymentStatus = async (connection, orderId, { status, transactionId }) => {

    await connection.query(
        `
        UPDATE payments
        SET
            payment_status = ?,
            transaction_id = COALESCE(?, transaction_id),
            paid_at = CASE WHEN ? = 'success' THEN CURRENT_TIMESTAMP ELSE paid_at END
        WHERE order_id = ?
        `,
        [status, transactionId, status, orderId]
    );

};
