import pool from "../config/db.js";
import crypto from "crypto";
import Razorpay from "razorpay";

import { getCartItems, getOrCreateCart } from "../models/cart.model.js";
import { getAddressById } from "../models/address.model.js";
import { getWebsiteSettings } from "../models/settings.model.js";

import {
    createOrder,
    createOrderItem,
    decrementVariantStock,
    getOrderById,
    updateOrderAfterPayment,
    markOrderPaymentFailed
} from "../models/checkout.model.js";

import { createPayment, updatePaymentStatus } from "../models/payment.model.js";
import { sendAdminEmail } from "./emailService.js";

import {
    initiateCheckoutSchema,
    verifyPaymentSchema
} from "../validators/checkout.validator.js";

import { generateOrderNumber } from "../utils/generateOrderNumber.js";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Mirrors frontend/utils/shipping.js — keep both in sync if you change either.
// TODO: consider adding a real `free_shipping_threshold` column to
// website_settings instead of parsing a number out of announcement_text.
const SHIPPING_FEE = 40;
const DEFAULT_THRESHOLD = 999;

function getFreeShippingThreshold(announcementText) {

    if (!announcementText) return DEFAULT_THRESHOLD;

    const match = announcementText.replace(/,/g, "").match(/(\d+(\.\d+)?)/);

    if (!match) return DEFAULT_THRESHOLD;

    const value = Number(match[1]);

    return Number.isFinite(value) && value > 0 ? value : DEFAULT_THRESHOLD;

}

export const initiateCheckoutService = async (userId, body) => {

    const { address_id } = initiateCheckoutSchema.parse(body);

    const address = await getAddressById(userId, address_id);

    if (!address) {
        throw new Error("Shipping address not found.");
    }

    const cartId = await getOrCreateCart(userId);
    const cartItems = await getCartItems(cartId);

    if (cartItems.length === 0) {
        throw new Error("Your cart is empty.");
    }

    const subtotal = cartItems.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0
    );

    const settings = await getWebsiteSettings();
    const threshold = getFreeShippingThreshold(settings?.announcement_text);
    const shippingFee = subtotal >= threshold ? 0 : SHIPPING_FEE;

    const taxAmount = 0;
    const totalAmount = subtotal + shippingFee + taxAmount;

    const orderNumber = generateOrderNumber();

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        const orderId = await createOrder(connection, {
            user_id: userId,
            shipping_address_id: address_id,
            order_number: orderNumber,
            subtotal,
            discount_amount: 0,
            shipping_fee: shippingFee,
            tax_amount: taxAmount,
            total_amount: totalAmount
        });

        for (const item of cartItems) {
            await createOrderItem(connection, orderId, item);
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100), // paise
            currency: "INR",
            receipt: orderNumber
        });

        await createPayment(connection, {
            order_id: orderId,
            transaction_id: razorpayOrder.id,
            amount: totalAmount
        });

        await connection.commit();

        return {
            order_id: orderId,
            order_number: orderNumber,
            razorpay_order_id: razorpayOrder.id,
            amount: totalAmount,
            currency: "INR",
            key_id: process.env.RAZORPAY_KEY_ID
        };

    } catch (error) {

        await connection.rollback();
        throw error;

    } finally {

        connection.release();

    }

};

export const verifyPaymentService = async (userId, body) => {

    const {
        order_id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = verifyPaymentSchema.parse(body);

    const order = await getOrderById(userId, order_id);

    if (!order) {
        throw new Error("Order not found.");
    }

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        if (expectedSignature !== razorpay_signature) {

            await markOrderPaymentFailed(connection, order_id);

            await updatePaymentStatus(connection, order_id, {
                status: "failed",
                transactionId: razorpay_payment_id
            });

            await connection.commit();

            throw new Error("Payment verification failed.");

        }

        await updateOrderAfterPayment(connection, order_id, "paid");

        await updatePaymentStatus(connection, order_id, {
            status: "success",
            transactionId: razorpay_payment_id
        });

        const [items] = await connection.query(
            `SELECT variant_id, quantity FROM order_items WHERE order_id = ?`,
            [order_id]
        );

        for (const item of items) {
            await decrementVariantStock(connection, item.variant_id, item.quantity);
        }

        const [[cartRow]] = await connection.query(
            `SELECT cart_id FROM carts WHERE user_id = ?`,
            [userId]
        );

        if (cartRow) {
            await connection.query(
                `DELETE FROM cart_items WHERE cart_id = ?`,
                [cartRow.cart_id]
            );
        }

        await connection.commit();

        // Email is sent after commit so a Resend outage never rolls back a real payment.
        try {

            const [[customer]] = await pool.query(
                `SELECT name, email FROM users WHERE user_id = ?`,
                [userId]
            );

            const [items] = await pool.query(
                `SELECT product_name, size, color, quantity, unit_price, total_price FROM order_items WHERE order_id = ?`,
                [order_id]
            );

            if (customer?.email) {

                const itemLines = items
                    .map((item) => {
                        const variant = [item.size, item.color].filter(Boolean).join(", ");
                        return `${item.product_name}${variant ? ` (${variant})` : ""} — Qty ${item.quantity} — ₹${Number(item.total_price).toFixed(2)}`;
                    })
                    .join("\n");

                await sendOrderConfirmationEmail({
                    to: user.email,
                    customerName: user.name,
                    orderNumber: order.order_number,
                    items: orderItems, // the array of line items you just inserted
                    totalAmount: order.total_amount,
                });

            }

        } catch (emailError) {

            console.warn("Order confirmation email failed to send:", err.message);

        }

        return {
            order_id,
            order_number: order.order_number,
            status: "paid"
        };

    } catch (error) {

        await connection.rollback();
        throw error;

    } finally {

        connection.release();

    }

};