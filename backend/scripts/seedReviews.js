import pool from "../src/config/db.js";
import { getReviewsSummary } from "../src/models/review.model.js";

const sampleReviews = [
  {
    product_name_match: "Selvedge",
    user_name: "Rahul Verma",
    rating: 5,
    title: "Incredible vintage texture & quality",
    comment: "The heavyweight corduroy and selvedge finish exceeded my expectations. Feels authentic 70s heritage workwear. Fit is spot on!",
  },
  {
    product_name_match: "Denim Jacket",
    user_name: "Aditya Roy",
    rating: 5,
    title: "Best vintage trucker jacket ever",
    comment: "The acid wash and brass buttons give it genuine 90s rock vibes. Heavy cotton denim that breaks in wonderfully after a few wears.",
  },
  {
    product_name_match: "Linen",
    user_name: "Sneha Kapoor",
    rating: 5,
    title: "Breathable & timeless style",
    comment: "Super premium French linen. Light, airy, perfect for warm summers and effortless casual layering.",
  },
  {
    product_name_match: "Leather",
    user_name: "Vikram Malhotra",
    rating: 5,
    title: "Masterpiece leather craftsmanship",
    comment: "Full grain leather with rich patina and heavy-duty YKK zippers. Smells amazing and feels like it will last a lifetime.",
  },
  {
    product_name_match: "Tweed",
    user_name: "Aman Sharma",
    rating: 4,
    title: "Classic British aesthetic",
    comment: "Heavy wool herringbone tweed that keeps you warm in winter. Great tailoring and structured lapels.",
  },
  {
    product_name_match: "Chino",
    user_name: "Karthik N",
    rating: 5,
    title: "Perfect relaxed vintage fit",
    comment: "Pleated front with high-rise waist. Sits comfortably with vintage boots and oxfords. Highly recommended!",
  },
  {
    product_name_match: "Overshirt",
    user_name: "Devendra Patel",
    rating: 4,
    title: "Great layering piece",
    comment: "Love the earth tones and vintage horn buttons. Heavy enough to wear as an overshirt in cooler evenings.",
  },
  {
    product_name_match: "Vintage",
    user_name: "Pooja Hegde",
    rating: 5,
    title: "Stunning craftsmanship & details",
    comment: "Everything from the stitch count to the aged fabric wash feels authentically vintage. Fast shipping too!",
  },
  {
    product_name_match: "Flannel",
    user_name: "Nikhil Joshi",
    rating: 5,
    title: "Ultra soft & warm flannel",
    comment: "Brushed heavy cotton flannel that gets softer with every wash. The plaid pattern is very 90s grunge.",
  },
  {
    product_name_match: "Sweater",
    user_name: "Meera Krishnan",
    rating: 4,
    title: "Cozy knit with retro charm",
    comment: "Cable knit patterns are deep and textured. Feels snug without feeling restrictive.",
  },
  {
    product_name_match: "Harrington",
    user_name: "Arjun Das",
    rating: 5,
    title: "Iconic mod styling",
    comment: "Classic tartan lining and elasticated ribbed waistband. One of the best vintage silhouettes in my wardrobe.",
  },
  {
    product_name_match: "Bomber",
    user_name: "Tanmay B",
    rating: 4,
    title: "Rugged military look",
    comment: "Nylon sheen and flight tag details look brilliant. Warm insulation for winter rides.",
  }
];

async function seedReviews() {
  try {
    const [products] = await pool.query("SELECT product_id, name FROM products LIMIT 50");
    if (!products.length) {
      console.log("No products found to attach reviews.");
      return;
    }

    console.log(`Found ${products.length} products. Seeding reviews...`);

    for (let i = 0; i < sampleReviews.length; i++) {
      const sample = sampleReviews[i];
      const matchedProd = products.find((p) =>
        p.name.toLowerCase().includes(sample.product_name_match.toLowerCase())
      ) || products[i % products.length];

      const [res] = await pool.query(
        `INSERT INTO reviews (product_id, user_name, rating, title, comment, created_at)
         VALUES (?, ?, ?, ?, ?, NOW() - INTERVAL ? DAY)`,
        [
          matchedProd.product_id,
          sample.user_name,
          sample.rating,
          sample.title,
          sample.comment,
          (i * 3) + 1,
        ]
      );

      // Update product stats
      const summary = await getReviewsSummary(matchedProd.product_id);
      await pool.query(
        `UPDATE products SET review_count = ?, average_rating = ? WHERE product_id = ?`,
        [summary.total_reviews, summary.average_rating, matchedProd.product_id]
      );

      console.log(`Added review #${res.insertId} for product "${matchedProd.name}" (Rating: ${sample.rating}★)`);
    }

    console.log("All sample reviews seeded successfully!");
  } catch (err) {
    console.error("Error seeding reviews:", err);
  } finally {
    process.exit(0);
  }
}

seedReviews();
