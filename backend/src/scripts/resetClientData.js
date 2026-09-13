import pool from "../config/db.js";

/**
 * Standard Production Client Wipe Script for Vintage Fashion.
 * Invoked whenever preparing the store for client handover.
 *
 * Rules:
 * 1. Preserves ONLY the admin user credentials (user_id = 1, user_code = 'VF-USR-1001').
 * 2. Preserves website_settings (store contact, address, delivery configurations).
 * 3. Wipes all catalog items (products, variants, images, categories, brands, banners, promotions).
 * 4. Wipes all transactions (orders, items, payments, returns, carts, wishlists, reviews, notifications, sessions).
 * 5. Resets all AUTO_INCREMENTs to 1 and business_sequences to start fresh at 1001.
 */
export async function resetClientData() {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    console.log("=== EXECUTING CLIENT HANDOVER RESET ===");

    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");

    // 1. Marketing & Promos
    await connection.query("TRUNCATE TABLE promotional_card_products;");
    await connection.query("TRUNCATE TABLE promotional_cards;");
    await connection.query("TRUNCATE TABLE promotion_products;");
    await connection.query("TRUNCATE TABLE promotions;");
    await connection.query("TRUNCATE TABLE flash_sale_products;");
    await connection.query("TRUNCATE TABLE flash_sales;");
    await connection.query("TRUNCATE TABLE banner_products;");
    await connection.query("TRUNCATE TABLE homepage_banners;");
    await connection.query("TRUNCATE TABLE homepage_sections;");
    await connection.query("TRUNCATE TABLE featured_products;");

    // 2. Catalog
    await connection.query("TRUNCATE TABLE product_images;");
    await connection.query("TRUNCATE TABLE product_variants;");
    await connection.query("TRUNCATE TABLE product_tags;");
    await connection.query("TRUNCATE TABLE tags;");
    await connection.query("TRUNCATE TABLE products;");
    await connection.query("TRUNCATE TABLE categories;");
    await connection.query("TRUNCATE TABLE brands;");

    // 3. Transactions & User Data
    await connection.query("TRUNCATE TABLE order_items;");
    await connection.query("TRUNCATE TABLE returns;");
    await connection.query("TRUNCATE TABLE payments;");
    await connection.query("TRUNCATE TABLE orders;");
    await connection.query("TRUNCATE TABLE shiprocket_webhook_logs;");
    await connection.query("TRUNCATE TABLE cart_items;");
    await connection.query("TRUNCATE TABLE carts;");
    await connection.query("TRUNCATE TABLE wishlist_items;");
    await connection.query("TRUNCATE TABLE reviews;");
    await connection.query("TRUNCATE TABLE notifications;");
    await connection.query("TRUNCATE TABLE email_logs;");
    await connection.query("TRUNCATE TABLE email_verifications;");
    await connection.query("TRUNCATE TABLE phone_verifications;");
    await connection.query("TRUNCATE TABLE password_resets;");
    await connection.query("TRUNCATE TABLE user_sessions;");
    await connection.query("TRUNCATE TABLE user_addresses;");

    // 4. Admin preservation
    const [adminRows] = await connection.query("SELECT * FROM users WHERE role = 'admin' LIMIT 1;");
    if (adminRows.length === 0) {
      throw new Error("Cannot locate admin credentials to preserve!");
    }
    const admin = adminRows[0];

    await connection.query("TRUNCATE TABLE users;");
    await connection.query(`
      INSERT INTO users (user_id, user_code, name, email, password_hash, phone, avatar_url, role, is_email_verified, account_status)
      VALUES (1, 'VF-USR-1001', ?, ?, ?, ?, ?, 'admin', 1, 'active');
    `, [
      admin.name || 'admin',
      admin.email,
      admin.password_hash,
      admin.phone || '9398393619',
      admin.avatar_url || null
    ]);

    // 5. Sequence reset
    await connection.query("TRUNCATE TABLE business_sequences;");
    await connection.query(`
      INSERT INTO business_sequences (sequence_key, prefix, current_val)
      VALUES 
        ('product', 'VF-PRD-', 1000),
        ('order', 'VF-ORD-', 1000),
        ('return', 'VF-RET-', 1000),
        ('user', 'VF-USR-', 1001);
    `);

    // 6. Reset Auto Increments
    const tables = [
      "categories", "brands", "products", "product_variants",
      "product_images", "orders", "order_items", "payments",
      "returns", "carts", "cart_items", "wishlist_items",
      "reviews", "notifications", "email_logs", "user_addresses",
      "promotions", "promotional_cards", "homepage_banners", "flash_sales"
    ];

    for (const tbl of tables) {
      try {
        await connection.query(`ALTER TABLE \`${tbl}\` AUTO_INCREMENT = 1;`);
      } catch (e) {}
    }

    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
    await connection.commit();
    console.log("=== CLIENT RESET COMPLETE: CLEAN DB WITH ONLY ADMIN & SITE INFO ===");
  } catch (err) {
    await connection.rollback();
    console.error("Client reset failed:", err);
    throw err;
  } finally {
    connection.release();
  }
}

// If run directly via node
if (process.argv[1]?.endsWith("resetClientData.js")) {
  resetClientData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
