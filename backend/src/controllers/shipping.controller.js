import * as ShippingService from "../services/shipping.service.js";
import { getAddressById } from "../models/address.model.js";
import { getOrCreateCart } from "../models/cart.model.js";
import { recalculateCartForCheckout } from "../services/checkout.service.js";

/**
 * POST /api/shipping/calculate
 * Calculates live shipping fee & delivery method based on address_id or pincode
 */
export const calculateShipping = async (req, res, next) => {
    try {
        const { address_id, pincode } = req.body;
        const userId = req.user?.user_id;

        let destinationPincode = pincode;

        if (address_id) {
            if (!userId) {
                return res.status(401).json({ message: "Authentication required to resolve saved address." });
            }
            const address = await getAddressById(userId, address_id);
            if (!address) {
                return res.status(404).json({ message: "Selected address not found." });
            }
            destinationPincode = address.pincode;
        }

        if (!destinationPincode) {
            return res.status(400).json({ message: "Destination pincode or address_id is required." });
        }

        // Get user's cart items to determine weight & dimensions
        let pricedItems = [];
        let subtotal = 0;
        let discountAmount = 0;

        if (userId) {
            const cartId = await getOrCreateCart(userId);
            pricedItems = await recalculateCartForCheckout(cartId);
            subtotal = pricedItems.reduce(
                (sum, item) => sum + Number(item.final_price) * item.quantity,
                0
            );
            discountAmount = pricedItems.reduce(
                (sum, item) => sum + Number(item.discount_amount) * item.quantity,
                0
            );
        }

        const deliveryResult = await ShippingService.determineDeliveryMethodAndRate({
            destinationPincode,
            cartItems: pricedItems,
            subtotal,
        });

        res.json({
            success: true,
            pincode: destinationPincode,
            ...deliveryResult,
            pricing: {
                subtotal,
                discount_amount: discountAmount,
                shipping_fee: deliveryResult.shipping_fee,
                total_amount: subtotal - discountAmount + deliveryResult.shipping_fee,
            },
        });
    } catch (error) {
        console.error("Calculate shipping error:", error.message);
        res.status(error.statusCode || 400).json({
            success: false,
            code: error.code || "SHIPPING_CALCULATION_FAILED",
            message: error.message || "Unable to calculate shipping rate.",
        });
    }
};

/**
 * GET /api/shipping/settings
 * Public endpoint to fetch active store delivery options
 */
export const getPublicShippingSettings = async (req, res, next) => {
    try {
        const settings = await ShippingService.getShippingSettings();
        res.json({
            success: true,
            settings: {
                shop_name: settings.shop_name,
                shop_city: settings.shop_city,
                shop_state: settings.shop_state,
                local_delivery_enabled: settings.local_delivery_enabled,
                local_delivery_charge: settings.local_delivery_charge,
                courier_delivery_enabled: settings.courier_delivery_enabled,
                courier_provider: settings.courier_provider,
                has_pickup_pincode: Boolean(settings.pickup_pincode),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/shipping/admin/settings
 * Admin endpoint to view full shipping configuration
 */
export const getAdminShippingSettings = async (req, res, next) => {
    try {
        const settings = await ShippingService.getShippingSettings();
        res.json({
            success: true,
            settings,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/shipping/admin/settings
 * Admin endpoint to update shipping configuration
 */
export const updateAdminShippingSettings = async (req, res, next) => {
    try {
        const updated = await ShippingService.updateShippingSettings(req.body);
        res.json({
            success: true,
            message: "Shipping & Delivery settings updated successfully.",
            settings: updated,
        });
    } catch (error) {
        next(error);
    }
};
