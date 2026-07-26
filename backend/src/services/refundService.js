import razorpay from "../config/razorpay.js";

// Refunds go back through Razorpay to the customer's original payment
// method — there's no other correct way to "send money back" for a
// card/UPI payment. This requires the original payment to have been
// captured (which it will be, since your checkout flow only marks an
// order as paid after Razorpay confirms capture).
//
// In Razorpay TEST mode, this returns a mock-successful refund object
// without moving real money — safe to test against freely.
export const processRefund = async ({ razorpayPaymentId, amount }) => {
    if (!razorpayPaymentId) {
        throw new Error("No Razorpay payment ID on record for this order — cannot refund.");
    }

    const refund = await razorpay.payments.refund(razorpayPaymentId, {
        amount: Math.round(amount * 100), // Razorpay expects paise, not rupees
    });

    return {
        refundId: refund.id,
        status: refund.status, // "processed" | "pending" | "failed"
        amount: refund.amount / 100,
    };
};