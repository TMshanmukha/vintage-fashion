import pool from "../config/db.js";

export async function migrateDeliverySchema() {
    console.log("Starting Delivery Schema Migration...");

    const executeSafeAlter = async (tableName, columnName, alterSql) => {
        try {
            const [cols] = await pool.query(
                `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
                [tableName, columnName]
            );
            if (cols.length === 0) {
                console.log(`Adding column ${columnName} to ${tableName}...`);
                await pool.query(alterSql);
                console.log(`✓ Added ${columnName} to ${tableName}`);
            } else {
                console.log(`- Column ${columnName} already exists in ${tableName}`);
            }
        } catch (err) {
            console.error(`Error altering ${tableName}.${columnName}:`, err.message);
            throw err;
        }
    };

    // 1. orders table
    await executeSafeAlter("orders", "delivery_method", "ALTER TABLE orders ADD COLUMN delivery_method ENUM('LOCAL', 'COURIER') DEFAULT 'COURIER' AFTER payment_status");

    // 2. website_settings table
    await executeSafeAlter("website_settings", "shop_name", "ALTER TABLE website_settings ADD COLUMN shop_name VARCHAR(100) DEFAULT 'Vintage Fashion'");
    await executeSafeAlter("website_settings", "shop_address", "ALTER TABLE website_settings ADD COLUMN shop_address VARCHAR(255) DEFAULT 'Old Town, Boya Vedi Street'");
    await executeSafeAlter("website_settings", "shop_city", "ALTER TABLE website_settings ADD COLUMN shop_city VARCHAR(100) DEFAULT 'Anantapur'");
    await executeSafeAlter("website_settings", "shop_state", "ALTER TABLE website_settings ADD COLUMN shop_state VARCHAR(100) DEFAULT 'Andhra Pradesh'");
    await executeSafeAlter("website_settings", "shop_country", "ALTER TABLE website_settings ADD COLUMN shop_country VARCHAR(100) DEFAULT 'India'");
    await executeSafeAlter("website_settings", "pickup_pincode", "ALTER TABLE website_settings ADD COLUMN pickup_pincode VARCHAR(10) DEFAULT ''");
    await executeSafeAlter("website_settings", "local_delivery_enabled", "ALTER TABLE website_settings ADD COLUMN local_delivery_enabled TINYINT(1) DEFAULT 1");
    await executeSafeAlter("website_settings", "local_delivery_pincodes", "ALTER TABLE website_settings ADD COLUMN local_delivery_pincodes TEXT");
    await executeSafeAlter("website_settings", "local_delivery_charge", "ALTER TABLE website_settings ADD COLUMN local_delivery_charge DECIMAL(10,2) DEFAULT 0.00");
    await executeSafeAlter("website_settings", "courier_delivery_enabled", "ALTER TABLE website_settings ADD COLUMN courier_delivery_enabled TINYINT(1) DEFAULT 1");
    await executeSafeAlter("website_settings", "courier_provider", "ALTER TABLE website_settings ADD COLUMN courier_provider VARCHAR(50) DEFAULT 'shiprocket'");

    // 3. products table
    await executeSafeAlter("products", "package_weight", "ALTER TABLE products ADD COLUMN package_weight DECIMAL(6,3) DEFAULT 0.500");
    await executeSafeAlter("products", "package_length", "ALTER TABLE products ADD COLUMN package_length DECIMAL(6,2) DEFAULT 20.00");
    await executeSafeAlter("products", "package_width", "ALTER TABLE products ADD COLUMN package_width DECIMAL(6,2) DEFAULT 15.00");
    await executeSafeAlter("products", "package_height", "ALTER TABLE products ADD COLUMN package_height DECIMAL(6,2) DEFAULT 5.00");

    console.log("Delivery Schema Migration Completed Successfully!");
}

if (process.argv[1]?.endsWith("migrateDeliverySchema.js")) {
    migrateDeliverySchema()
        .then(() => process.exit(0))
        .catch(err => {
            console.error("Migration failed:", err);
            process.exit(1);
        });
}
