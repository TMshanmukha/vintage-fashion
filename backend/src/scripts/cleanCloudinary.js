import cloudinary from "../config/cloudinary.js";

/**
 * Deletes all uploaded product, brand, category, banner, promotional,
 * and avatar images from Cloudinary while preserving the account itself.
 */
export async function cleanAllCloudinaryImages() {
  console.log("=== STARTING CLOUDINARY MEDIA CLEANUP ===");

  const prefixes = [
    "products",
    "brands",
    "categories",
    "banners",
    "promotional-cards",
    "flash-sales",
    "avatars",
    "vintage-fashion",
    "vintage_fashion"
  ];

  for (const prefix of prefixes) {
    try {
      console.log(`Deleting resources in prefix: ${prefix}...`);
      const result = await cloudinary.api.delete_resources_by_prefix(prefix);
      console.log(`Deleted ${prefix}:`, Object.keys(result.deleted || {}).length, "files");
    } catch (err) {
      console.warn(`Warning deleting prefix ${prefix}:`, err.message);
    }
  }

  // Also catch any dangling uploaded images in root or other folders
  try {
    let nextCursor = null;
    do {
      const res = await cloudinary.api.resources({
        max_results: 100,
        next_cursor: nextCursor
      });

      const publicIds = (res.resources || [])
        .map(r => r.public_id)
        .filter(id => !id.startsWith("site_assets/")); // preserve core site branding if needed

      if (publicIds.length > 0) {
        console.log(`Deleting batch of ${publicIds.length} resources...`);
        await cloudinary.api.delete_resources(publicIds);
      }

      nextCursor = res.next_cursor;
    } while (nextCursor);
  } catch (err) {
    console.warn("Catch-all deletion note:", err.message);
  }

  console.log("=== CLOUDINARY MEDIA CLEANUP COMPLETED ===");
}

if (process.argv[1]?.endsWith("cleanCloudinary.js")) {
  cleanAllCloudinaryImages()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Cloudinary cleanup failed:", err);
      process.exit(1);
    });
}
