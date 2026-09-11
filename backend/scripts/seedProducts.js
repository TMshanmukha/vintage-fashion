import pool from "../src/config/db.js";

const newBrands = [
  { name: "Carhartt", slug: "carhartt" },
  { name: "Harley-Davidson", slug: "harley-davidson" },
  { name: "Champion", slug: "champion" },
  { name: "Diesel", slug: "diesel" },
  { name: "Wrangler", slug: "wrangler" },
  { name: "Nike Vintage", slug: "nike-vintage" },
  { name: "Barbour", slug: "barbour" },
  { name: "Burberry", slug: "burberry" },
  { name: "Lee", slug: "lee" },
  { name: "Calvin Klein", slug: "calvin-klein" }
];

const newCategories = [
  { name: "Oversized Tees", slug: "oversized-tees" },
  { name: "Denim & Jeans", slug: "denim-jeans" },
  { name: "Leather & Suede", slug: "leather-suede" },
  { name: "Hoodies & Sweats", slug: "hoodies-sweats" },
  { name: "Flannels & Plaid", slug: "flannels-plaid" },
  { name: "Workwear & Cargo", slug: "workwear-cargo" }
];

// High-quality fashion clothing image catalog
const fashionImages = {
  shirts: [
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
  ],
  jackets: [
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80",
  ],
  pants: [
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80",
  ],
  hoodies: [
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
  ]
};

const adjectives = [
  "Vintage 90s", "Retro 80s", "Classic Heritage", "Distressed Oversized", 
  "Heavyweight", "Acid Washed", "Authentic 1994", "Selvedge", 
  "Corduroy Embroidered", "Faded Washed", "Archive Collection", 
  "Double Knee Workwear", "Colorblock Track", "Sherpa Lined", "Raw Indigo"
];

const productTypes = [
  { type: "Oxford Button-Down Shirt", categoryType: "shirts", imgKey: "shirts", priceRange: [1299, 1899], mrpRange: [2499, 3499] },
  { type: "Flannel Plaid Overshirt", categoryType: "shirts", imgKey: "shirts", priceRange: [1499, 2199], mrpRange: [2999, 3999] },
  { type: "Heavyweight Boxy Graphic Tee", categoryType: "shirts", imgKey: "shirts", priceRange: [899, 1399], mrpRange: [1799, 2499] },
  { type: "Corduroy Workwear Overshirt", categoryType: "shirts", imgKey: "shirts", priceRange: [1699, 2499], mrpRange: [3299, 4499] },
  { type: "Trucker Denim Jacket", categoryType: "jackets", imgKey: "jackets", priceRange: [2499, 3999], mrpRange: [4999, 6999] },
  { type: "Varsity Wool Bomber Jacket", categoryType: "jackets", imgKey: "jackets", priceRange: [2999, 4999], mrpRange: [5999, 8999] },
  { type: "Leather Biker Jacket", categoryType: "jackets", imgKey: "jackets", priceRange: [3999, 6499], mrpRange: [7999, 11999] },
  { type: "Retro Windbreaker Pullover", categoryType: "jackets", imgKey: "jackets", priceRange: [1899, 2799], mrpRange: [3499, 4999] },
  { type: "501 Original Fit Jeans", categoryType: "pants", imgKey: "pants", priceRange: [1999, 2999], mrpRange: [3999, 5499] },
  { type: "Relaxed Fit Cargo Trousers", categoryType: "pants", imgKey: "pants", priceRange: [1599, 2499], mrpRange: [2999, 4299] },
  { type: "Wide Leg Carpenter Pants", categoryType: "pants", imgKey: "pants", priceRange: [1799, 2699], mrpRange: [3499, 4799] },
  { type: "Vintage Wash Chino Trousers", categoryType: "pants", imgKey: "pants", priceRange: [1499, 2299], mrpRange: [2799, 3999] },
  { type: "Reverse Weave Pullover Hoodie", categoryType: "hoodies", imgKey: "hoodies", priceRange: [1899, 2899], mrpRange: [3499, 4999] },
  { type: "Vintage Crewneck Sweatshirt", categoryType: "hoodies", imgKey: "hoodies", priceRange: [1499, 2299], mrpRange: [2799, 3999] },
];

const badges = ["Bestseller", "Trending", "Rare Find", "Vintage Exclusive", "Limited Edition", "Staff Pick", null, null];

const colorOptions = [
  { name: "Washed Black", hex: "#1f2421" },
  { name: "Vintage Olive", hex: "#4b5320" },
  { name: "Faded Indigo", hex: "#3b5998" },
  { name: "Off-White", hex: "#f4f1ea" },
  { name: "Earth Brown", hex: "#5c4033" },
  { name: "Burgundy", hex: "#6b1724" },
  { name: "Charcoal Grey", hex: "#36454f" }
];

const topSizes = ["S", "M", "L", "XL", "XXL"];
const bottomSizes = ["28", "30", "32", "34", "36"];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function seedDatabase(targetCount = 100) {
  console.log(`Starting to seed ${targetCount} authentic vintage products...`);

  // 1. Ensure Brands exist
  for (const b of newBrands) {
    await pool.query(
      `INSERT IGNORE INTO brands (name, slug) VALUES (?, ?)`,
      [b.name, b.slug]
    );
  }

  // 2. Ensure Categories exist
  for (const c of newCategories) {
    await pool.query(
      `INSERT IGNORE INTO categories (name, slug) VALUES (?, ?)`,
      [c.name, c.slug]
    );
  }

  // Fetch all brands and categories
  const [allBrands] = await pool.query(`SELECT brand_id, name, slug FROM brands`);
  const [allCategories] = await pool.query(`SELECT category_id, name, slug FROM categories`);

  console.log(`Available Brands: ${allBrands.length}, Categories: ${allCategories.length}`);

  let insertedCount = 0;

  for (let i = 1; i <= targetCount; i++) {
    const brand = getRandomItem(allBrands);
    const category = getRandomItem(allCategories);
    const pType = getRandomItem(productTypes);
    const adj = getRandomItem(adjectives);

    const productName = `${adj} ${brand.name} ${pType.type}`;
    const slug = `${slugify(productName)}-${Date.now()}-${i}`;
    const uniqueId = `${Date.now().toString().slice(-5)}${i}`;
    const sku = `VF-${brand.slug.substring(0, 3).toUpperCase()}-${uniqueId}`;

    const price = getRandomInt(pType.priceRange[0], pType.priceRange[1]);
    const originalPrice = getRandomInt(pType.mrpRange[0], pType.mrpRange[1]);
    const badge = getRandomItem(badges);

    const imagesList = fashionImages[pType.imgKey] || fashionImages.shirts;
    const primaryImage = getRandomItem(imagesList);
    const secondaryImage = getRandomItem(imagesList);

    const description = `This authentic ${productName} embodies pure retro aesthetic and durable craftmanship. Crafted from premium breathable fabrics with distinct vintage wash and original hardware. Perfect for everyday statement wear and versatile layered styling.`;

    const initialRating = (Math.random() * 1.2 + 3.8).toFixed(1); // 3.8 to 5.0
    const initialReviewCount = getRandomInt(2, 35);

    // Insert Product
    const [pResult] = await pool.query(
      `INSERT INTO products (
        category_id, brand_id, name, slug, description,
        price, mrp, original_price, badge, sku,
        stock_quantity, average_rating, review_count, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category.category_id,
        brand.brand_id,
        productName,
        slug,
        description,
        price,
        originalPrice,
        originalPrice,
        badge,
        sku,
        getRandomInt(30, 150),
        Number(initialRating),
        initialReviewCount,
        1,
      ]
    );

    const productId = pResult.insertId;

    // Insert Images
    await pool.query(
      `INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
       VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)`,
      [
        productId, primaryImage, productName, 0, 1,
        productId, secondaryImage, `${productName} view 2`, 1, 0,
      ]
    );

    // Insert Variants with 2 distinct colors
    const isBottom = pType.categoryType === "pants";
    const availableSizes = isBottom ? bottomSizes : topSizes;
    
    // Pick 2 guaranteed distinct colors
    const shuffledColors = [...colorOptions].sort(() => 0.5 - Math.random());
    const selectedColors = [shuffledColors[0], shuffledColors[1]];

    let totalStock = 0;
    for (const color of selectedColors) {
      for (const size of availableSizes) {
        const stock = getRandomInt(5, 25);
        totalStock += stock;
        const colorCode = color.name.replace(/[^A-Za-z]/g, "").substring(0, 3).toUpperCase();
        const variantSku = `${sku}-${colorCode}-${size}`;

        await pool.query(
          `INSERT INTO product_variants (
            product_id, size, color, color_hex, image_url, is_default, sku_variant, stock_quantity, price_modifier
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            productId,
            size,
            color.name,
            color.hex,
            primaryImage,
            size === "M" || size === "32" ? 1 : 0,
            variantSku,
            stock,
            0,
          ]
        );
      }
    }

    // Update total stock quantity
    await pool.query(
      `UPDATE products SET stock_quantity = ? WHERE product_id = ?`,
      [totalStock, productId]
    );

    insertedCount++;
    if (insertedCount % 20 === 0 || insertedCount === targetCount) {
      console.log(`✓ Inserted ${insertedCount}/${targetCount} products...`);
    }
  }

  const [finalCount] = await pool.query(`SELECT COUNT(*) as count FROM products WHERE is_active = 1`);
  console.log(`\n🎉 Seeding complete! Total active products in database: ${finalCount[0].count}`);
}

// Execute directly if run via CLI
if (process.argv[1]?.endsWith("seedProducts.js")) {
  seedDatabase(100)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}
