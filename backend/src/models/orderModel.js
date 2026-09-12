import pool from "../config/db.js";

export const getAllOrders = async ({ status, search, page = 1, limit = 20 }) => {

    const offset = (page - 1) * limit;
    const params = [];
    // Strictly only display confirmed paid or refunded orders; unpaid/abandoned drafts are filtered out
    let where = "WHERE o.payment_status IN ('paid', 'success', 'refunded')";

    if (status) {
        where += " AND o.order_status = ?";
        params.push(status);
    }

    if (search) {
        where += " AND (o.order_number LIKE ? OR u.name LIKE ? OR u.email LIKE ?)";
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.query(
        `
        SELECT
    o.order_id,
    o.order_number,
    o.subtotal,
    o.discount_amount,
    o.shipping_fee,
    o.total_amount,
    o.order_status,
    o.payment_status,
    o.delivery_method,
    o.shipment_id,
    o.awb_number,
    o.courier_name,
    o.shipping_status,
    o.shipping_label_url,
    o.invoice_url,
    o.pickup_scheduled,
    o.ordered_at,
    u.user_id,
    COALESCE(u.name, 'Customer') AS customer_name,
    COALESCE(u.email, '—') AS customer_email,
    COALESCE(u.phone, '—') AS customer_phone,
    a.address_line1,
    a.address_line2,
    a.city,
    a.state,
    a.pincode,
    a.country,
    (
        SELECT COUNT(*)
        FROM order_items oi
        WHERE oi.order_id = o.order_id
    ) AS item_count
FROM orders o
LEFT JOIN users u
    ON u.user_id = o.user_id
LEFT JOIN user_addresses a
    ON a.address_id = o.shipping_address_id
${where}
ORDER BY o.ordered_at DESC
LIMIT ? OFFSET ?;
        `,
        [...params, Number(limit), Number(offset)]
    );

    const [[{ total }]] = await pool.query(
        `
        SELECT COUNT(DISTINCT o.order_id) AS total
        FROM orders o
        LEFT JOIN users u ON u.user_id = o.user_id
        ${where}
        `,
        params
    );

    return { rows, total };
};

export const getOrderById = async (orderId) => {

    const [rows] = await pool.query(
        `
        SELECT
            o.*,
            COALESCE(u.name, 'Customer') AS customer_name,
            COALESCE(u.email, '—') AS customer_email,
            COALESCE(u.phone, '—') AS customer_phone,
            a.address_line1,
            a.address_line2,
            a.city,
            a.state,
            a.pincode,
            a.country
        FROM orders o
        LEFT JOIN users u ON u.user_id = o.user_id
        LEFT JOIN user_addresses a ON a.address_id = o.shipping_address_id
        WHERE o.order_id = ?
        LIMIT 1
        `,
        [orderId]
    );

    return rows[0];
};

export const getOrderItems = async (orderId) => {

    const [rows] = await pool.query(
        `
        SELECT order_item_id, variant_id, product_name, sku_variant, size, color, quantity, unit_price, total_price
        FROM order_items
        WHERE order_id = ?
        `,
        [orderId]
    );

    return rows;
};

export const getOrderPayment = async (orderId) => {

    const [rows] = await pool.query(
        `SELECT * FROM payments WHERE order_id = ? LIMIT 1`,
        [orderId]
    );

    return rows[0];
};

export const restoreOrderStock = async (orderId) => {
    try {
        const [items] = await pool.query(
            `SELECT variant_id, quantity FROM order_items WHERE order_id = ?`,
            [orderId]
        );
        for (const item of items) {
            if (item.variant_id && item.quantity > 0) {
                await pool.query(
                    `UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE variant_id = ?`,
                    [item.quantity, item.variant_id]
                );
            }
        }
    } catch (err) {
        console.warn("Failed to restore order stock:", err.message);
    }
};

export const updateOrderStatus = async (orderId, status) => {

    await pool.query(
        `UPDATE orders SET order_status = ? WHERE order_id = ?`,
        [status, orderId]
    );
};

// Called after courierService.createShipment() (or trackShipment()) returns,
// to persist the shipment info onto the order row.
export const updateShipmentInfo = async (orderId, { trackingId, courierPartner, status, events }) => {

    await pool.query(
        `
        UPDATE orders
        SET tracking_id = ?, courier_partner = ?, shipment_status = ?, tracking_events = ?
        WHERE order_id = ?
        `,
        [trackingId, courierPartner, status, JSON.stringify(events || []), orderId]
    );
};

export const updatePaymentStatus = async (orderId, status) => {

    await pool.query(
        `
        UPDATE payments
        SET payment_status = ?, paid_at = IF(? = 'success', NOW(), paid_at)
        WHERE order_id = ?
        `,
        [status, status, orderId]
    );

    await pool.query(
        `UPDATE orders SET payment_status = ? WHERE order_id = ?`,
        [status === "success" ? "paid" : status, orderId]
    );
};

export const getOrderStats = async () => {

    const [[stats]] = await pool.query(
        `
        SELECT
            COUNT(*) AS total_orders,
            COALESCE(SUM(CASE WHEN order_status = 'pending' THEN 1 ELSE 0 END), 0) AS pending_orders,
            COALESCE(SUM(CASE WHEN order_status = 'confirmed' THEN 1 ELSE 0 END), 0) AS confirmed_orders,
            COALESCE(SUM(CASE WHEN order_status = 'processing' THEN 1 ELSE 0 END), 0) AS processing_orders,
            COALESCE(SUM(CASE WHEN order_status = 'shipped' THEN 1 ELSE 0 END), 0) AS shipped_orders,
            COALESCE(SUM(CASE WHEN order_status = 'delivered' THEN 1 ELSE 0 END), 0) AS delivered_orders,
            COALESCE(SUM(CASE WHEN order_status = 'cancelled' THEN 1 ELSE 0 END), 0) AS cancelled_orders,
            COALESCE(SUM(CASE WHEN payment_status != 'refunded' AND order_status != 'cancelled' THEN total_amount ELSE 0 END), 0) AS total_revenue,
            COALESCE(SUM(CASE WHEN payment_status = 'refunded' THEN total_amount ELSE 0 END), 0) AS total_refunded
        FROM orders
        WHERE payment_status IN ('paid', 'success', 'refunded')
        `
    );

    const [[{ pending_returns }]] = await pool.query(
        `SELECT COUNT(*) AS pending_returns FROM returns WHERE status = 'pending'`
    );

    return { ...stats, return_requested_orders: pending_returns || 0 };
};

export const getOrdersByUserId = async (userId, { page = 1, limit = 20 } = {}) => {
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
        `SELECT order_id, order_number, subtotal, discount_amount, shipping_fee,
            tax_amount, total_amount, order_status, payment_status, delivery_method,
            awb_number, courier_name, shipping_status, shipment_id,
            tracking_id, courier_partner, tracking_events, ordered_at
     FROM orders
     WHERE user_id = ? AND payment_status IN ('paid', 'success', 'refunded')
     ORDER BY ordered_at DESC
     LIMIT ? OFFSET ?`,
        [userId, Number(limit), Number(offset)]
    );

    const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) AS total FROM orders WHERE user_id = ? AND payment_status IN ('paid', 'success', 'refunded')`,
        [userId]
    );

    return { rows, total };
};

// Confirms the order belongs to this user before letting them touch it
export const getOrderOwnedByUser = async (orderId, userId) => {
    const [rows] = await pool.query(
        `SELECT
            o.order_id, o.order_number, o.order_status, o.payment_status, o.delivery_method, o.user_id,
            o.subtotal, o.discount_amount, o.shipping_fee, o.tax_amount, o.total_amount,
            o.awb_number, o.courier_name, o.shipping_status,
            o.shipping_label_url, o.invoice_url, o.tracking_url,
            o.estimated_delivery, o.pickup_scheduled, o.delivered_at,
            a.address_line1, a.address_line2, a.city, a.state, a.pincode, a.country
         FROM orders o
         JOIN user_addresses a ON a.address_id = o.shipping_address_id
         WHERE o.order_id = ? AND o.user_id = ? AND o.payment_status IN ('paid', 'success', 'refunded')`,
        [orderId, userId]
    );
    return rows[0] || null;
};

// Scoped to a specific customer — never trust orderId alone without checking ownership
export const getOrderByIdForUser = async (orderId, userId) => {
    const [rows] = await pool.query(
        `SELECT * FROM orders WHERE order_id = ? AND user_id = ? LIMIT 1`,
        [orderId, userId]
    );
    return rows[0] || null;
};

export const setOrderStatusForUser = async (orderId, userId, status) => {
    const [result] = await pool.query(
        `UPDATE orders SET order_status = ? WHERE order_id = ? AND user_id = ?`,
        [status, orderId, userId]
    );
    return result.affectedRows > 0;
};

// Persists Shiprocket shipment data onto the order after successful creation.
export const updateShiprocketInfo = async (orderId, {
  shiprocket_order_id,
  shipment_id,
  awb_number,
  courier_name,
  shipping_label_url,
  invoice_url,
  pickup_scheduled,
}) => {
  await pool.query(
    `
    UPDATE orders
    SET shiprocket_order_id = ?,
        shipment_id = ?,
        awb_number = ?,
        courier_name = ?,
        shipping_label_url = ?,
        invoice_url = ?,
        pickup_scheduled = ?,
        shipment_created_at = NOW()
    WHERE order_id = ?
    `,
    [shiprocket_order_id, shipment_id, awb_number, courier_name, shipping_label_url, invoice_url, pickup_scheduled, orderId]
  );
};

// Updates just the live tracking status — called from the tracking sync,
// separate from the one-time shipment creation above.
export const updateShippingStatus = async (orderId, { shipping_status, delivered_at }) => {
  await pool.query(
    `
    UPDATE orders
    SET shipping_status = ?, delivered_at = COALESCE(?, delivered_at)
    WHERE order_id = ?
    `,
    [shipping_status, delivered_at || null, orderId]
  );
};

export const updateDeliveryMethod = async (orderId, deliveryMethod) => {
  await pool.query(
    `UPDATE orders SET delivery_method = ? WHERE order_id = ?`,
    [deliveryMethod, orderId]
  );
};

export const updateLocalDeliveryStatus = async (orderId, { order_status, shipping_status }) => {
  const isDelivered = order_status === "delivered" || shipping_status === "DELIVERED";
  await pool.query(
    `
    UPDATE orders
    SET order_status = COALESCE(?, order_status),
        shipping_status = COALESCE(?, shipping_status),
        delivered_at = IF(?, NOW(), delivered_at)
    WHERE order_id = ?
    `,
    [order_status || null, shipping_status || null, isDelivered, orderId]
  );
};