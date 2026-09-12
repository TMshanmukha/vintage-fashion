import pool from "../config/db.js";
import shiprocketApi from "../config/shiprocket.js";

/**
 * Fetch store shipping & delivery configuration from website_settings
 */
export async function getShippingSettings() {
    const [rows] = await pool.query(
        `SELECT
            shop_name,
            shop_address,
            shop_city,
            shop_state,
            shop_country,
            pickup_pincode,
            local_delivery_enabled,
            local_delivery_pincodes,
            local_delivery_charge,
            courier_delivery_enabled,
            courier_provider
        FROM website_settings
        WHERE setting_id = 1
        LIMIT 1`
    );

    const row = rows[0] || {};

    const rawPincodes = row.local_delivery_pincodes || "515001, 515002, 515003, 515004, 515005";
    const localPincodesList = rawPincodes
        .split(/[,\n\r]+/)
        .map((p) => p.trim())
        .filter((p) => /^\d{6}$/.test(p));

    return {
        shop_name: row.shop_name || "Vintage Fashion",
        shop_address: row.shop_address || "Old Town, Boya Vedi Street",
        shop_city: row.shop_city || "Anantapur",
        shop_state: row.shop_state || "Andhra Pradesh",
        shop_country: row.shop_country || "India",
        pickup_pincode: (row.pickup_pincode || process.env.SHIPROCKET_PICKUP_PINCODE || "515001").trim(),
        local_delivery_enabled: Boolean(row.local_delivery_enabled ?? 1),
        local_delivery_pincodes: localPincodesList,
        local_delivery_pincodes_raw: rawPincodes,
        local_delivery_charge: Number(row.local_delivery_charge || 0),
        courier_delivery_enabled: Boolean(row.courier_delivery_enabled ?? 1),
        courier_provider: row.courier_provider || "shiprocket",
    };
}

/**
 * Update store shipping & delivery configuration in website_settings
 */
export async function updateShippingSettings(data) {
    const allowedFields = [
        "shop_name",
        "shop_address",
        "shop_city",
        "shop_state",
        "shop_country",
        "pickup_pincode",
        "local_delivery_enabled",
        "local_delivery_pincodes",
        "local_delivery_charge",
        "courier_delivery_enabled",
        "courier_provider",
    ];

    const updates = {};
    for (const key of allowedFields) {
        if (data[key] !== undefined) {
            updates[key] = data[key];
        }
    }

    if (Object.keys(updates).length === 0) {
        return getShippingSettings();
    }

    const setClause = Object.keys(updates)
        .map((k) => `${k} = ?`)
        .join(", ");
    const values = [...Object.values(updates), 1];

    await pool.query(
        `UPDATE website_settings SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE setting_id = ?`,
        values
    );

    return getShippingSettings();
}

/**
 * Calculate total package weight & dimensions for cart items
 */
export function calculatePackageMetrics(cartItems = []) {
    let totalWeight = 0;
    let maxLength = 20;
    let maxWidth = 15;
    let totalHeight = 0;

    for (const item of cartItems) {
        const qty = Math.max(1, Number(item.quantity) || 1);
        const itemWeight = Math.max(0.1, Number(item.package_weight) || 0.5);
        const itemLength = Math.max(10, Number(item.package_length) || 20);
        const itemWidth = Math.max(10, Number(item.package_width) || 15);
        const itemHeight = Math.max(2, Number(item.package_height) || 5);

        totalWeight += itemWeight * qty;
        if (itemLength > maxLength) maxLength = itemLength;
        if (itemWidth > maxWidth) maxWidth = itemWidth;
        totalHeight += itemHeight * qty;
    }

    // Default minimum parcel weight is 0.5 kg for courier APIs
    const finalWeight = Math.max(0.5, Number(totalWeight.toFixed(3)));
    const finalHeight = Math.max(5, Math.min(100, Math.round(totalHeight)));

    return {
        weight: finalWeight,
        length: Math.round(maxLength),
        width: Math.round(maxWidth),
        height: finalHeight,
    };
}

/**
 * Determine Delivery Method and calculate exact verified shipping charge
 *
 * Rules:
 * 1. If destination matches local pincodes & local delivery enabled:
 *    -> LOCAL DELIVERY, shipping_fee = local_delivery_charge (defaults to ₹0)
 * 2. If destination is non-local:
 *    -> COURIER DELIVERY, calculated via Shiprocket API using store pickup_pincode (Anantapur)
 *    -> If courier API fails or unserviceable: THROW ERROR (NO FAKE ₹69 FALLBACK)
 */
export async function determineDeliveryMethodAndRate({
    destinationPincode,
    cartItems = [],
    subtotal = 0,
}) {
    const cleanDestinationPincode = String(destinationPincode || "").trim();

    if (!cleanDestinationPincode || !/^\d{6}$/.test(cleanDestinationPincode)) {
        const error = new Error("Invalid destination pincode. Please enter a valid 6-digit Indian pincode.");
        error.code = "INVALID_PINCODE";
        error.statusCode = 400;
        throw error;
    }

    const settings = await getShippingSettings();

    // 1. Check Local Delivery
    const isLocalPincode =
        settings.local_delivery_enabled &&
        settings.local_delivery_pincodes.includes(cleanDestinationPincode);

    if (isLocalPincode) {
        return {
            delivery_method: "LOCAL",
            shipping_fee: Number(settings.local_delivery_charge || 0),
            is_local: true,
            courier_name: "Local Store Delivery",
            etd: "Same Day / Next Day",
            description: "Hand-delivered directly from our Anantapur Old Town store.",
            package_metrics: calculatePackageMetrics(cartItems),
            pickup_pincode: settings.pickup_pincode,
        };
    }

    // 2. Check Courier Delivery
    if (!settings.courier_delivery_enabled) {
        const error = new Error("Courier delivery is currently unavailable. Please contact store support.");
        error.code = "COURIER_DISABLED";
        error.statusCode = 400;
        throw error;
    }

    if (!settings.pickup_pincode || !/^\d{6}$/.test(settings.pickup_pincode)) {
        const error = new Error(
            "Store pickup pincode is not configured in Admin Shipping Settings. Courier calculation cannot proceed."
        );
        error.code = "STORE_PINCODE_MISSING";
        error.statusCode = 500;
        throw error;
    }

    const metrics = calculatePackageMetrics(cartItems);

    try {
        const response = await shiprocketApi.get("/courier/serviceability/", {
            params: {
                pickup_postcode: settings.pickup_pincode,
                delivery_postcode: cleanDestinationPincode,
                weight: metrics.weight,
                cod: 0, // prepaid only
                declared_value: subtotal || 999,
            },
        });

        const serviceabilityData = response.data;
        const couriers = serviceabilityData?.data?.available_courier_companies || [];

        if (!Array.isArray(couriers) || couriers.length === 0) {
            const error = new Error(
                `Delivery is currently unavailable for pincode ${cleanDestinationPincode}. Please try another delivery address.`
            );
            error.code = "PINCODE_UNSERVICEABLE";
            error.statusCode = 400;
            throw error;
        }

        // Sort by rate ascending to pick the most economical verified rate
        const validCouriers = couriers
            .filter((c) => c && c.rate !== undefined && c.rate !== null && Number(c.rate) > 0)
            .sort((a, b) => Number(a.rate) - Number(b.rate));

        if (validCouriers.length === 0) {
            const error = new Error(
                `No active courier rate found for pincode ${cleanDestinationPincode}. Delivery cannot proceed.`
            );
            error.code = "NO_COURIER_RATE";
            error.statusCode = 400;
            throw error;
        }

        const chosenCourier = validCouriers[0];
        const exactRate = Math.ceil(Number(chosenCourier.rate));

        return {
            delivery_method: "COURIER",
            shipping_fee: exactRate,
            is_local: false,
            courier_name: chosenCourier.courier_name || "Express Courier",
            courier_company_id: chosenCourier.courier_company_id || null,
            etd: chosenCourier.etd || "3-5 Business Days",
            description: `Shipped via ${chosenCourier.courier_name || "Courier"}`,
            package_metrics: metrics,
            pickup_pincode: settings.pickup_pincode,
            available_couriers_count: validCouriers.length,
        };
    } catch (apiError) {
        if (apiError.statusCode || apiError.code === "PINCODE_UNSERVICEABLE" || apiError.code === "NO_COURIER_RATE") {
            throw apiError;
        }

        console.error("Shiprocket Courier Serviceability Error:", apiError.response?.data || apiError.message);

        const apiMessage =
            apiError.response?.data?.message ||
            apiError.response?.data?.error ||
            "Unable to calculate courier shipping rate at this time. Please try again or verify your pincode.";

        const error = new Error(apiMessage);
        error.code = "COURIER_RATE_FAILED";
        error.statusCode = 400;
        throw error;
    }
}
