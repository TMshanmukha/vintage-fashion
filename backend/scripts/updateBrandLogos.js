import pool from "../src/config/db.js";

const brandLogos = {
  "vintagef": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&auto=format&fit=crop&q=80",
  "levis": "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=400&auto=format&fit=crop&q=80",
  "ralph-lauren": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&auto=format&fit=crop&q=80",
  "tommy-hilfiger": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&auto=format&fit=crop&q=80",
  "carhartt": "https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=400&auto=format&fit=crop&q=80",
  "harley-davidson": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&auto=format&fit=crop&q=80",
  "champion": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&auto=format&fit=crop&q=80",
  "diesel": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&auto=format&fit=crop&q=80",
  "wrangler": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&auto=format&fit=crop&q=80",
  "nike-vintage": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80",
  "barbour": "https://images.unsplash.com/photo-1544441893-675973e31985?w=400&auto=format&fit=crop&q=80",
  "burberry": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
  "lee": "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=400&auto=format&fit=crop&q=80",
  "calvin-klein": "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&auto=format&fit=crop&q=80"
};

async function updateBrandLogos() {
  try {
    const [brands] = await pool.query("SELECT brand_id, name, slug, logo_url FROM brands");
    console.log(`Found ${brands.length} brands in database.`);

    for (const b of brands) {
      const newLogo = brandLogos[b.slug] || "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&auto=format&fit=crop&q=80";
      await pool.query("UPDATE brands SET logo_url = ? WHERE brand_id = ?", [newLogo, b.brand_id]);
      console.log(`Updated brand "${b.name}" (${b.slug}) with photo: ${newLogo}`);
    }

    console.log("All brand photos updated successfully!");
  } catch (err) {
    console.error("Error updating brand logos:", err);
  } finally {
    process.exit(0);
  }
}

updateBrandLogos();
