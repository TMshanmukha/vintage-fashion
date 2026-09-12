import pool from "../config/db.js";
import razorpay from "../config/razorpay.js";
import * as OrderModel from "../models/orderModel.js";
import * as ReturnModel from "../models/returnModel.js";
import * as NotificationService from "./notificationService.js";
import * as CourierService from "./courierService.js";
import * as RefundService from "./refundService.js";
import { getIO } from "../socket/index.js";
import * as ShiprocketService from "./shiprocket.service.js";
import { getOrderById, getOrderItems } from "../models/orderModel.js";


export const listOrders = async ({ status, search, page, limit }) => {
    return OrderModel.getAllOrders({ status, search, page, limit });
};

export const getOrderDetail = async (orderId) => {
    const order = await OrderModel.getOrderById(orderId);
    if (!order) return null;

    const items = await OrderModel.getOrderItems(orderId);
    const payment = await OrderModel.getOrderPayment(orderId);

    return { order, items, payment };
};

// Central place order status changes flow through — this is where the
// courier gets triggered and the customer's own tab gets pushed the
// update live, in addition to the existing notification.
export const changeOrderStatus = async (orderId, status) => {
    const order = await OrderModel.getOrderById(orderId);
    if (!order) return null;

    if (status === "cancelled" && order.order_status !== "cancelled") {
        await OrderModel.restoreOrderStock(orderId);
    }

    await OrderModel.updateOrderStatus(orderId, status);

    await NotificationService.createNotification({
        title: "Order status updated",
        body: `Order #${order.order_number} is now ${status}`,
        type: "order",
        referenceId: orderId
    });

    try {
        getIO().to(`user:${order.user_id}`).emit("order:status-changed", {
            orderId,
            order_status: status,
        });
        getIO().to("admins").emit("admin:order-updated", {
            orderId,
            order_status: status,
        });
    } catch (err) {
        console.warn("Socket emit skipped:", err.message);
    }

    return order;
};

export const changePaymentStatus = async (orderId, status) => {
    if (status === "refunded") {
        try {
            const order = await OrderModel.getOrderById(orderId);
            const payment = await OrderModel.getOrderPayment(orderId);
            if (payment && payment.razorpay_payment_id && !payment.razorpay_payment_id.startsWith("mock_")) {
                await RefundService.processRefund({
                    razorpayPaymentId: payment.razorpay_payment_id,
                    amount: order.total_amount,
                });
            }
        } catch (e) {
            console.warn("Auto-refund on payment status change skipped or failed:", e.message);
        }
    }
    return OrderModel.updatePaymentStatus(orderId, status);
};

export const syncRazorpayPayment = async (orderId) => {
    const order = await OrderModel.getOrderById(orderId);
    if (!order) {
        return { success: false, message: "Order not found." };
    }

    const payment = await OrderModel.getOrderPayment(orderId);
    if (!payment) {
        return { success: false, message: "No payment record found for this order." };
    }

    if (order.payment_status === "paid" || order.payment_status === "success") {
        return { success: true, payment_status: "paid", message: "Order is already recorded as paid." };
    }

    const txId = payment.transaction_id || "";
    let capturedPayment = null;

    try {
        if (txId.startsWith("order_")) {
            const rzpPayments = await razorpay.orders.fetchPayments(txId);
            capturedPayment = rzpPayments?.items?.find(p => p.status === "captured" || p.status === "authorized");
        } else if (txId.startsWith("pay_")) {
            const p = await razorpay.payments.fetch(txId);
            if (p.status === "captured" || p.status === "authorized") {
                capturedPayment = p;
            }
        }
    } catch (err) {
        console.warn("Razorpay API sync lookup error:", err.message);
        return { success: false, message: `Razorpay API lookup: ${err.message}` };
    }

    if (capturedPayment) {
        await pool.query(`UPDATE orders SET payment_status = 'paid' WHERE order_id = ?`, [orderId]);
        await pool.query(
            `UPDATE payments SET payment_status = 'success', transaction_id = ?, paid_at = COALESCE(paid_at, NOW()) WHERE order_id = ?`,
            [capturedPayment.id, orderId]
        );

        try {
            getIO().to(`user:${order.user_id}`).emit("order:payment-status-changed", {
                orderId,
                payment_status: "paid",
            });
            getIO().to("admins").emit("admin:order-updated", {
                orderId,
                payment_status: "paid",
            });
        } catch (sockErr) {
            console.warn("Socket emission skipped:", sockErr.message);
        }

        return {
            success: true,
            payment_status: "paid",
            transaction_id: capturedPayment.id,
            message: `Payment verified! ₹${(capturedPayment.amount / 100).toFixed(2)} captured on Razorpay.`
        };
    }

    return {
        success: false,
        payment_status: payment.payment_status || "pending",
        message: "Razorpay shows payment is not yet completed/captured."
    };
};

export const getStats = async () => {
    return OrderModel.getOrderStats();
};

// --- Returns management ---

export const listReturns = async ({ status, page, limit }) => {
    return ReturnModel.getAllReturns({ status, page, limit });
};

// action: "approve" | "reject" | "schedule_pickup" | "picked_up" | "received" | "process_refund"
export const changeReturnStatus = async (returnId, action) => {
    const returnRequest = await ReturnModel.getReturnById(returnId);
    if (!returnRequest) return { error: "NOT_FOUND" };

    let nextStatus;
    let pickupTrackingId = null;

    switch (action) {
        case "approve":
            // Just an approval — customer sees exactly this and nothing
            // further happens automatically. Scheduling pickup is a
            // separate, deliberate admin action below.
            nextStatus = "approved";
            break;
        case "reject":
            nextStatus = "rejected";
            break;
        case "schedule_pickup": {
            nextStatus = "pickup_scheduled";

            const order = await OrderModel.getOrderById(returnRequest.order_id);
            const items = await OrderModel.getOrderItems(returnRequest.order_id);

            // Real Shiprocket reverse pickup — replaces the mocked
            // CourierService call. Pickup happens at the CUSTOMER's
            // address (from the order), delivery destination is your
            // registered shop pickup location.
            const returnShipment = await ShiprocketService.createReturnShipment(
                order,
                returnRequest,
                items,
                process.env.SHIPROCKET_PICKUP_LOCATION_NAME
            );

            // Reusing the existing pickup_tracking_id column — it's
            // semantically "the tracking ID for this pickup," which is
            // exactly what Shiprocket's return AWB is. No schema change
            // needed.
            pickupTrackingId = returnShipment.awb_code || returnShipment.order_id;
            break;
        }
        case "picked_up":
            nextStatus = "picked_up";
            break;
        case "received":
            nextStatus = "received";
            break;
        case "process_refund": {
            // This is the actual money-movement step. It looks up the
            // exact payment tied to THIS return's order — the admin never
            // has to search for or identify who to refund; it's derived
            // straight from the return record itself.
            const order = await OrderModel.getOrderById(returnRequest.order_id);
            const payment = await OrderModel.getOrderPayment(returnRequest.order_id);

            if (!payment || !payment.razorpay_payment_id) {
                return { error: "NO_PAYMENT_ON_RECORD" };
            }

            const refund = await RefundService.processRefund({
                razorpayPaymentId: payment.razorpay_payment_id,
                amount: order.total_amount,
            });

            if (refund.status !== "processed" && refund.status !== "pending") {
                return { error: "REFUND_FAILED" };
            }

            // Reuses the existing payment/order status update — this is
            // what makes revenue stats and the order's payment badge
            // update correctly, since getOrderStats already excludes
            // payment_status = 'refunded' from revenue.
            await OrderModel.updatePaymentStatus(returnRequest.order_id, "refunded");

            nextStatus = "refunded";
            break;
        }
        default:
            return { error: "INVALID_ACTION" };
    }

    await ReturnModel.updateReturnStatus(returnId, nextStatus, pickupTrackingId);

    await NotificationService.createNotification({
        title: "Return status updated",
        body: `Return #${returnId} is now ${nextStatus.replace("_", " ")}`,
        type: "order",
        referenceId: returnRequest.order_id,
    });

    try {
        getIO().to(`user:${returnRequest.user_id}`).emit("return:status-changed", {
            returnId,
            status: nextStatus,
        });
        getIO().to("admins").emit("admin:return-updated", {
            returnId,
            status: nextStatus,
        });
        // Also push the order's updated payment status live, since
        // refunding changes what MyAccountPage should show for the order.
        if (nextStatus === "refunded") {
            getIO().to(`user:${returnRequest.user_id}`).emit("order:payment-status-changed", {
                orderId: returnRequest.order_id,
                payment_status: "refunded",
            });
        }
    } catch (err) {
        console.warn("Socket emit skipped:", err.message);
    }

    return { success: true, status: nextStatus };
};

export const changeDeliveryMethod = async (orderId, deliveryMethod) => {
    const order = await OrderModel.getOrderById(orderId);
    if (!order) return null;

    const method = String(deliveryMethod).toUpperCase();
    if (!["LOCAL", "COURIER"].includes(method)) {
        throw new Error("Invalid delivery method. Allowed: LOCAL, COURIER");
    }

    await OrderModel.updateDeliveryMethod(orderId, method);

    try {
        getIO().to(`user:${order.user_id}`).emit("order:delivery-method-changed", {
            orderId,
            delivery_method: method,
        });
        getIO().to("admins").emit("admin:order-updated", {
            orderId,
            delivery_method: method,
        });
    } catch (err) {
        console.warn("Socket emit skipped:", err.message);
    }

    return { success: true, delivery_method: method };
};

export const changeLocalDeliveryStatus = async (orderId, action) => {
    const order = await OrderModel.getOrderById(orderId);
    if (!order) return null;

    let orderStatus = order.order_status;
    let shippingStatus = order.shipping_status;

    switch (action) {
        case "ready_for_delivery":
            shippingStatus = "READY_FOR_DELIVERY";
            orderStatus = "processing";
            break;
        case "out_for_delivery":
            shippingStatus = "OUT_FOR_DELIVERY";
            orderStatus = "shipped";
            break;
        case "delivered":
            shippingStatus = "DELIVERED";
            orderStatus = "delivered";
            break;
        default:
            throw new Error("Invalid local delivery action. Allowed: ready_for_delivery, out_for_delivery, delivered");
    }

    await OrderModel.updateLocalDeliveryStatus(orderId, {
        order_status: orderStatus,
        shipping_status: shippingStatus
    });

    const statusLabel = shippingStatus.replace(/_/g, " ");
    await NotificationService.createNotification({
        title: "Local Delivery Status Updated",
        body: `Order #${order.order_number} is now ${statusLabel}`,
        type: "order",
        referenceId: orderId,
    });

    try {
        getIO().to(`user:${order.user_id}`).emit("order:status-changed", {
            orderId,
            order_status: orderStatus,
            shipping_status: shippingStatus,
        });
        getIO().to("admins").emit("admin:order-updated", {
            orderId,
            order_status: orderStatus,
            shipping_status: shippingStatus,
        });
    } catch (err) {
        console.warn("Socket emit skipped:", err.message);
    }

    return {
        success: true,
        order_status: orderStatus,
        shipping_status: shippingStatus
    };
};