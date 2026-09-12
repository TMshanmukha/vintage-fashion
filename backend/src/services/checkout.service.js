import pool from "../config/db.js";
import crypto from "crypto";
import Razorpay from "razorpay";

import { getOrCreateCart, getCartItems } from "../models/cart.model.js";

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
import { sendOrderConfirmationEmail } from "./emailService.js";

import {
    initiateCheckoutSchema,
    verifyPaymentSchema
} from "../validators/checkout.validator.js";

import { generateOrderNumber } from "../utils/generateOrderNumber.js";

import { resolvePromotionForProduct, applyPromotion } from "./pricing/pricing.service.js";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

import { determineDeliveryMethodAndRate } from "./shipping.service.js";

// The ONLY place order pricing gets computed. Cart values (frozen at
// add-to-cart time) are never trusted directly here — every item's
// promotion is re-resolved fresh, in case a promotion expired, was
// deleted, or changed since the item was added to the cart.
export async function recalculateCartForCheckout(cartId) {
  const items = await getCartItems(cartId); // must join product_id + category_id + variant price

  return Promise.all(items.map(async (item) => {
    const promotion = await resolvePromotionForProduct(item.product_id);
    const pricing = applyPromotion(item.price, promotion); // item.price = base variant price, not stored final_price
    return { ...item, ...pricing };
  }));
}

export const initiateCheckoutService = async (userId, body) => {

    const { address_id } = initiateCheckoutSchema.parse(body);

    const address = await getAddressById(userId, address_id);

    if (!address) {
        throw new Error("Shipping address not found.");
    }

    const cartId = await getOrCreateCart(userId);

    // Re-resolve every item's price server-side right before checkout —
    // this is what makes the whole pricing system actually enforced,
    // instead of just displayed.
    const pricedItems = await recalculateCartForCheckout(cartId);

    if (pricedItems.length === 0) {
        throw new Error("Your cart is empty.");
    }

    const subtotal = pricedItems.reduce(
        (sum, item) => sum + Number(item.final_price) * item.quantity,
        0
    );

    const discountAmount = pricedItems.reduce(
        (sum, item) => sum + Number(item.discount_amount) * item.quantity,
        0
    );

    // Server-side verified delivery method & shipping calculation (Local vs Courier)
    // Frontend shipping amounts are never trusted — rates are strictly computed from DB / Courier APIs
    const deliveryResult = await determineDeliveryMethodAndRate({
        destinationPincode: address.pincode,
        cartItems: pricedItems,
        subtotal,
    });

    const deliveryMethod = deliveryResult.delivery_method; // 'LOCAL' or 'COURIER'
    const shippingFee = Number(deliveryResult.shipping_fee || 0);
    const taxAmount = 0;
    const totalAmount = subtotal - discountAmount + shippingFee + taxAmount;

    if (totalAmount <= 0) {
        throw new Error("Invalid order total amount.");
    }

    const orderNumber = generateOrderNumber();

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        const orderId = await createOrder(connection, {
            user_id: userId,
            shipping_address_id: address_id,
            order_number: orderNumber,
            subtotal,
            discount_amount: discountAmount,
            shipping_fee: shippingFee,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            delivery_method: deliveryMethod,
            shipping_status: deliveryMethod === "LOCAL" ? "Pending Local Delivery" : "Pending Shipment"
        });

        for (const item of pricedItems) {
            await createOrderItem(connection, orderId, item);
        }

        // Razorpay order amount strictly includes the server-verified shipping fee
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100), // paise
            currency: "INR",
            receipt: orderNumber,
            notes: {
                order_number: orderNumber,
                delivery_method: deliveryMethod,
                pincode: address.pincode,
                shipping_fee: String(shippingFee)
            }
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
            key_id: process.env.RAZORPAY_KEY_ID,
            delivery: {
                method: deliveryMethod,
                is_local: deliveryResult.is_local,
                courier_name: deliveryResult.courier_name,
                etd: deliveryResult.etd,
                description: deliveryResult.description
            },
            pricing: {
                subtotal,
                discount_amount: discountAmount,
                shipping_fee: shippingFee,
                tax_amount: taxAmount,
                total_amount: totalAmount,
            },
            items: pricedItems,
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

            const [orderItemRows] = await pool.query(
                `SELECT product_name, size, color, quantity, unit_price, total_price FROM order_items WHERE order_id = ?`,
                [order_id]
            );

            if (customer?.email) {
                await sendOrderConfirmationEmail({
                    to: customer.email,
                    customerName: customer.name,
                    orderNumber: order.order_number,
                    items: orderItemRows,
                    subtotal: Number(order.subtotal || 0),
                    discountAmount: Number(order.discount_amount || 0),
                    shippingFee: Number(order.shipping_fee || 0),
                    deliveryMethod: order.delivery_method || "COURIER",
                    totalAmount: Number(order.total_amount || 0),
                });
            }

        } catch (emailError) {

            console.warn("Order confirmation email failed to send:", emailError.message);

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