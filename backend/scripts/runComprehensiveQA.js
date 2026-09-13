import pool from "../src/config/db.js";
import {
  createCategoryService,
  getCategoriesService,
  updateCategoryService,
  deleteCategoryService,
  restoreCategoryService
} from "../src/services/category.service.js";

import {
  createBrandService,
  getBrandsService,
  getBrandBySlugService,
  updateBrandService,
  deleteBrandService
} from "../src/services/brand.service.js";

import {
  createProductService,
  getProductsService,
  getProductBySlugService,
  updateProductService,
  deleteProductService
} from "../src/services/product.service.js";

import {
  createBanner,
  getAllBanners,
  updateBanner,
  deleteBanner
} from "../src/models/marketing/banner.model.js";

import {
  createCard,
  getAllCards,
  updateCard,
  deleteCard
} from "../src/models/marketing/promotionalCard.model.js";

import {
  createFlashSale,
  getAllFlashSales,
  deleteFlashSale
} from "../src/models/marketing/flashSale.model.js";

import {
  createAddress,
  getAddressesByUser
} from "../src/models/address.model.js";

import {
  getOrCreateCart,
  upsertCartItem,
  getCartItems,
  deleteCartItem
} from "../src/models/cart.model.js";

import {
  addToWishlist,
  getWishlistByUser,
  removeFromWishlistDb
} from "../src/models/wishlist.model.js";

import {
  getOrderById,
  getAllOrders,
  updateOrderStatus
} from "../src/models/orderModel.js";

import {
  createReturn,
  getAllReturns,
  updateReturnStatus
} from "../src/models/returnModel.js";

import {
  createReview,
  getReviewsByProduct,
  getReviewsSummary,
  getAllReviewsForAdmin,
  deleteReviewById
} from "../src/models/review.model.js";

import * as NotificationService from "../src/services/notificationService.js";

let passedCount = 0;
let failedCount = 0;
const failures = [];

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}: ${details}`);
    failedCount++;
    failures.push({ testName, details });
  }
}

async function runComprehensiveQA() {
  console.log("=================================================================");
  console.log("🚀 STARTING FULL-SYSTEM AUTOMATED QA & FLOW VERIFICATION");
  console.log("=================================================================\n");

  const timestamp = Date.now();

  // -------------------------------------------------------------
  // TEST SUITE 1: CATEGORIES
  // -------------------------------------------------------------
  console.log("📂 [1/7] TESTING CATEGORY MANAGEMENT LIFECYCLE...");
  let testCatId = null;
  try {
    const cat = await createCategoryService({
      name: `QA_Category_${timestamp}`,
      description: "Automated QA Category Description",
      image_url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10"
    });
    testCatId = cat.category_id;
    assert(Boolean(testCatId), "Category Created Successfully", `ID: ${testCatId}`);

    const allCats = await getCategoriesService();
    assert(allCats.some(c => c.category_id === testCatId), "Category Listed in Catalog");

    const updatedCat = await updateCategoryService(testCatId, {
      name: `QA_Category_${timestamp}_Edited`,
      description: "Updated Category Description"
    });
    assert(updatedCat.name.includes("Edited"), "Category Updated Successfully");

    await deleteCategoryService(testCatId);
    const afterDelete = await getCategoriesService();
    assert(!afterDelete.some(c => c.category_id === testCatId && c.is_active), "Category Soft-Deleted");

    await restoreCategoryService(testCatId);
    const afterRestore = await getCategoriesService();
    assert(afterRestore.some(c => c.category_id === testCatId && c.is_active), "Category Restored Successfully");
  } catch (err) {
    assert(false, "Category Lifecycle Execution", err.message);
  }

  // -------------------------------------------------------------
  // TEST SUITE 2: BRANDS
  // -------------------------------------------------------------
  console.log("\n🏷️ [2/7] TESTING BRAND PARTNERS LIFECYCLE...");
  let testBrandId = null;
  let testBrandSlug = null;
  try {
    const brand = await createBrandService({
      name: `QA_Brand_${timestamp}`,
      description: "Automated QA Brand Description",
      logo_url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10"
    });
    testBrandId = brand.brand_id;
    testBrandSlug = brand.slug;
    assert(Boolean(testBrandId), "Brand Created Successfully", `ID: ${testBrandId}`);

    const brandBySlug = await getBrandBySlugService({ slug: testBrandSlug });
    assert(brandBySlug.brand_id === testBrandId, "Brand Fetched by Slug");

    const updatedBrand = await updateBrandService(
      { id: testBrandId },
      { name: `QA_Brand_${timestamp}_Edited`, description: "Updated Brand Description", is_active: true }
    );
    assert(updatedBrand.name.includes("Edited"), "Brand Updated Successfully");

    const brandList = await getBrandsService({ limit: 100 });
    assert(brandList.brands.some(b => b.brand_id === testBrandId), "Brand Listed in Brands Query");
  } catch (err) {
    assert(false, "Brand Lifecycle Execution", err.message);
  }

  // -------------------------------------------------------------
  // TEST SUITE 3: PRODUCTS & VARIANTS
  // -------------------------------------------------------------
  console.log("\n👕 [3/7] TESTING PRODUCT & VARIANT ENGINE...");
  let testProductId = null;
  let testProductSlug = null;
  let testVariantId = null;
  try {
    const productPayload = {
      category_id: testCatId,
      brand_id: testBrandId,
      name: `QA Vintage Denim Jacket ${timestamp}`,
      description: "Heavyweight authentic vintage denim jacket with brass hardware.",
      price: 2499,
      original_price: 3499,
      badge: "Bestseller",
      images: [
        {
          image_url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10",
          alt_text: "Front View",
          sort_order: 1,
          is_primary: true
        },
        {
          image_url: "https://images.unsplash.com/photo-1582552938357-32b906df40cb",
          alt_text: "Back View",
          sort_order: 2,
          is_primary: false
        }
      ],
      variants: [
        {
          size: "M",
          color: "Indigo Blue",
          color_hex: "#1e3a8a",
          stock_quantity: 15,
          price_modifier: 0
        },
        {
          size: "L",
          color: "Vintage Washed",
          color_hex: "#3b82f6",
          stock_quantity: 10,
          price_modifier: 200
        }
      ]
    };

    const createdProduct = await createProductService(productPayload);
    testProductId = createdProduct.product_id;
    testProductSlug = createdProduct.slug;
    testVariantId = createdProduct.variants?.[0]?.variant_id;
    assert(Boolean(testProductId), "Product Created with Images & Variants", `ID: ${testProductId}, SKU: ${createdProduct.sku}`);
    assert(createdProduct.variants?.length === 2, "Product Variants Auto-Generated");
    assert(createdProduct.stock_quantity === 25, "Total Stock Auto-Calculated (15 + 10 = 25)");

    const fetchedBySlug = await getProductBySlugService({ slug: testProductSlug });
    assert(fetchedBySlug.product_id === testProductId, "Product Fetched via Storefront Slug Route");
    assert(fetchedBySlug.images?.length === 2, "Product Gallery Images Retrieved");

    const queryResult = await getProductsService({ search: "Denim", category: testCatId, limit: 10 });
    assert(queryResult.products.some(p => p.product_id === testProductId), "Product Search & Filter by Category");

    const updatedProd = await updateProductService(
      { id: testProductId },
      {
        category_id: testCatId,
        brand_id: testBrandId,
        name: `QA Vintage Denim Jacket ${timestamp} (Premium Edition)`,
        description: "Updated heavyweight authentic denim.",
        price: 2799,
        original_price: 3999,
        badge: "Trending",
        stock_quantity: 30,
        images: productPayload.images,
        variants: [
          {
            variant_id: testVariantId,
            size: "M",
            color: "Indigo Blue",
            color_hex: "#1e3a8a",
            stock_quantity: 20,
            price_modifier: 0
          }
        ]
      }
    );
    assert(Number(updatedProd.price) === 2799, "Product Price & Metadata Updated");
    testVariantId = updatedProd.variants?.[0]?.variant_id || testVariantId;
  } catch (err) {
    assert(false, "Product & Variant Engine Execution", err.message);
  }

  // -------------------------------------------------------------
  // TEST SUITE 4: MARKETING (BANNERS, PROMO CARDS, FLASH SALES)
  // -------------------------------------------------------------
  console.log("\n🎯 [4/7] TESTING MARKETING & PROMOTIONS ENGINE...");
  let testBannerId = null;
  let testCardId = null;
  let testSaleId = null;
  try {
    testBannerId = await createBanner({
      title: `QA Winter Vintage Drop ${timestamp}`,
      subtitle: "Up to 50% Off Authentic Vintage",
      description: "Limited edition curated drop.",
      desktop_image_url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10",
      button_text: "Explore Now",
      button_link: "/shop",
      display_order: 1,
      status: "ACTIVE"
    });
    assert(Boolean(testBannerId), "Hero Banner Created Successfully", `ID: ${testBannerId}`);

    const banners = await getAllBanners();
    assert(banners.some(b => b.banner_id === testBannerId), "Hero Banner Listed in Active Banners");

    testCardId = await createCard({
      title: `QA Denim Jackets ${timestamp}`,
      subtitle: "Vintage Denim Collection",
      image_url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10",
      button_text: "Shop Denim",
      button_link: "/shop",
      display_order: 1,
      is_active: true
    });
    assert(Boolean(testCardId), "Promotional Card Created Successfully", `ID: ${testCardId}`);

    testSaleId = await createFlashSale({
      title: `QA Flash Sale 24H ${timestamp}`,
      discount_type: "PERCENTAGE",
      discount_value: 20,
      start_date: new Date(),
      end_date: new Date(Date.now() + 86400000)
    });
    assert(Boolean(testSaleId), "Flash Sale Campaign Created Successfully", `ID: ${testSaleId}`);
  } catch (err) {
    assert(false, "Marketing Engine Execution", err.message);
  }

  // -------------------------------------------------------------
  // TEST SUITE 5: CUSTOMER CART, WISHLIST, ADDRESSES & ORDERS
  // -------------------------------------------------------------
  console.log("\n🛒 [5/7] TESTING CUSTOMER CART, WISHLIST, ADDRESS & CHECKOUT FLOW...");
  let testAddressId = null;
  let testOrderId = null;
  const testUserId = 1; // Admin / Default test user
  try {
    testAddressId = await createAddress(testUserId, {
      label: "Home",
      address_line1: "Plot 42, Jubilee Hills, Road No. 36",
      address_line2: "Near Metro Pillar 104",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500033",
      country: "India",
      is_default: true
    });
    assert(Boolean(testAddressId), "Customer Shipping Address Saved", `ID: ${testAddressId}`);

    const userAddresses = await getAddressesByUser(testUserId);
    assert(userAddresses.some(a => a.address_id === testAddressId), "Shipping Address Retrieved in Address Book");

    const cartId = await getOrCreateCart(testUserId);
    assert(Boolean(cartId), "Customer Cart Initialized / Retrieved", `Cart ID: ${cartId}`);

    if (testVariantId) {
      await upsertCartItem(cartId, testVariantId, 2, {
        original_price: 3499,
        discount_percent: 20,
        discount_amount: 700,
        final_price: 2799,
        promotion_id: null
      });
      const cartItems = await getCartItems(cartId);
      assert(cartItems.some(i => i.variant_id === testVariantId), "Item Added to Cart with Pricing & Variant");
    }

    if (testProductId) {
      await addToWishlist(testUserId, testProductId);
      const wishlist = await getWishlistByUser(testUserId);
      assert(wishlist.some(w => w.product_id === testProductId), "Product Added to Customer Liked / Wishlist");

      await removeFromWishlistDb(testUserId, testProductId);
      const wishlistAfter = await getWishlistByUser(testUserId);
      assert(!wishlistAfter.some(w => w.product_id === testProductId), "Product Removed from Wishlist");
    }

    // Place Test Order
    const orderNumber = `VF-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const [orderResult] = await pool.query(
      `
      INSERT INTO orders
        (user_id, shipping_address_id, order_number, order_status, payment_status, delivery_method, subtotal, total_amount)
      VALUES (?, ?, ?, 'pending', 'paid', 'COURIER', 5598.00, 5598.00)
      `,
      [testUserId, testAddressId, orderNumber]
    );
    testOrderId = orderResult.insertId;
    assert(Boolean(testOrderId), "Order Placed & Stored with Sequence Number", `Order #: ${orderNumber}, ID: ${testOrderId}`);

    // Insert Order Item
    if (testVariantId) {
      await pool.query(
        `
        INSERT INTO order_items
          (order_id, variant_id, product_name, sku_variant, quantity, unit_price, total_price)
        VALUES (?, ?, 'QA Vintage Denim Jacket', 'VF-000001-BLU-M', 2, 2799.00, 5598.00)
        `,
        [testOrderId, testVariantId]
      );
    }

    // Update order status lifecycle
    await updateOrderStatus(testOrderId, "confirmed");
    const confirmedOrder = await getOrderById(testOrderId);
    assert(confirmedOrder.order_status === "confirmed", "Order Status Advanced to confirmed");

    await updateOrderStatus(testOrderId, "shipped");
    const shippedOrder = await getOrderById(testOrderId);
    assert(shippedOrder.order_status === "shipped", "Order Status Advanced to shipped");

    await updateOrderStatus(testOrderId, "delivered");
    const deliveredOrder = await getOrderById(testOrderId);
    assert(deliveredOrder.order_status === "delivered", "Order Status Advanced to delivered");
  } catch (err) {
    assert(false, "Customer & Order Flow Execution", err.message);
  }

  // -------------------------------------------------------------
  // TEST SUITE 6: RETURNS & REVIEWS ENGINE
  // -------------------------------------------------------------
  console.log("\n🔄 [6/7] TESTING RETURNS & PRODUCT REVIEWS ENGINE...");
  let testReturnId = null;
  let testReviewId = null;
  try {
    if (testOrderId) {
      testReturnId = await createReturn({
        orderId: testOrderId,
        userId: testUserId,
        reason: "Size is slightly larger than expected. Need size exchange."
      });
      assert(Boolean(testReturnId), "Customer Return Request Submitted", `Return ID: ${testReturnId}`);

      await updateReturnStatus(testReturnId, "approved", "Approved for exchange pickup.");
      const returnsRes = await getAllReturns({});
      const returnsArray = returnsRes.rows || returnsRes;
      const myReturn = returnsArray.find(r => r.return_id === testReturnId);
      assert(myReturn?.status === "approved", "Admin Return Status Updated to approved");
    }

    if (testProductId) {
      const reviewResult = await createReview({
        productId: testProductId,
        userId: testUserId,
        userName: "Antigravity QA Tester",
        rating: 5,
        title: "Incredible vintage quality!",
        comment: "The denim wash and stitching are truly authentic vintage. 10/10 recommendation."
      });
      testReviewId = reviewResult.insertId;
      assert(Boolean(testReviewId), "Customer Product Review Submitted", `Review ID: ${testReviewId}`);

      const summary = await getReviewsSummary(testProductId);
      assert(summary.total_reviews >= 1 && summary.average_rating === 5, "Product Average Rating & Total Reviews Auto-Synced");

      const adminReviews = await getAllReviewsForAdmin({ search: "Antigravity" });
      assert(adminReviews.reviews.some(r => r.review_id === testReviewId), "Review Visible in Admin Reviews Portal");

      await deleteReviewById(testReviewId);
      const summaryAfter = await getReviewsSummary(testProductId);
      assert(summaryAfter.total_reviews === 0, "Review Deleted & Product Stats Re-Calculated");
    }
  } catch (err) {
    assert(false, "Returns & Reviews Engine Execution", err.message);
  }

  // -------------------------------------------------------------
  // TEST SUITE 7: LIVE NOTIFICATIONS ENGINE
  // -------------------------------------------------------------
  console.log("\n🔔 [7/7] TESTING NOTIFICATION DISPATCH ENGINE...");
  try {
    const notif1 = await NotificationService.createNotification({
      title: "QA Test Order Received",
      body: "Customer placed a new order for Vintage Fashion.",
      type: "order",
      referenceId: testOrderId
    });
    assert(Boolean(notif1), "Order Notification Dispatched without Exceptions");

    const notif2 = await NotificationService.createNotification({
      title: "QA Low Stock Warning",
      body: "Product Vintage Denim Jacket has 5 units remaining.",
      type: "stock",
      referenceId: testProductId
    });
    assert(Boolean(notif2), "Stock Notification Dispatched without Exceptions");

    const notifList = await NotificationService.listNotifications();
    assert(Array.isArray(notifList) && notifList.length > 0, "Notifications Retrieved for Admin Portal");

    const unreadCount = await NotificationService.getUnreadCount();
    assert(typeof unreadCount === "number", `Unread Count Retrieved: ${unreadCount}`);
  } catch (err) {
    assert(false, "Notification Engine Execution", err.message);
  }

  // -------------------------------------------------------------
  // CLEANUP TEST DATA
  // -------------------------------------------------------------
  console.log("\n🧹 CLEANING UP QA TEST ARTIFACTS...");
  try {
    if (testBannerId) await deleteBanner(testBannerId);
    if (testCardId) await deleteCard(testCardId);
    if (testSaleId) await deleteFlashSale(testSaleId);
    if (testProductId) await deleteProductService({ id: testProductId });
    if (testBrandId) await deleteBrandService({ id: testBrandId });
    if (testCatId) await deleteCategoryService(testCatId);
    console.log("✓ Cleanup finished cleanly.");
  } catch (cleanErr) {
    console.warn("Cleanup note:", cleanErr.message);
  }

  // -------------------------------------------------------------
  // FINAL SCORE & REPORT
  // -------------------------------------------------------------
  console.log("\n=================================================================");
  console.log(`📊 FINAL QA VERIFICATION REPORT:`);
  console.log(`   TOTAL TESTS RUN: ${passedCount + failedCount}`);
  console.log(`   ✅ PASSED:       ${passedCount}`);
  console.log(`   ❌ FAILED:       ${failedCount}`);
  console.log("=================================================================");

  if (failedCount > 0) {
    console.error("\nFAILURES SUMMARY:");
    console.table(failures);
    process.exit(1);
  } else {
    console.log("\n🎉 ALL 100% OF FULL-SYSTEM QA CHECKS PASSED WITH ZERO ERRORS!");
    process.exit(0);
  }
}

runComprehensiveQA();
