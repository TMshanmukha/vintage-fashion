import * as NotificationService from "../services/notificationService.js";

// Call this right after an order is inserted in your checkout/order controller
export const notifyNewOrder = async (order) => {
    await NotificationService.createNotification({
        title: "New order received",
        body: `Order #${order.order_number} placed — ₹${order.total_amount}`,
        type: "order",
        referenceId: order.order_id
    });
};

// Call this from your product stock-update logic when stock_quantity drops low
export const notifyLowStock = async (product, threshold = 5) => {
    if (product.stock_quantity > threshold) return;

    await NotificationService.createNotification({
        title: "Low stock alert",
        body: `${product.name} has only ${product.stock_quantity} left`,
        type: "stock",
        referenceId: product.product_id
    });
};

// Call this from your signup controller after a new user is created
export const notifyNewUser = async (user) => {
    await NotificationService.createNotification({
        title: "New user registered",
        body: `${user.name} just signed up`,
        type: "user",
        referenceId: user.user_id
    });
};
