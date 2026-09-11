/**
 * Image Optimization Helper
 * Automatically transforms Unsplash, Cloudinary, and local image URLs
 * to optimal sizes, compression, and modern formats (WebP/AVIF) for Lighthouse 100 performance.
 */
export function getOptimizedImageUrl(src, width = 400, quality = 75) {
  if (!src || typeof src !== "string") {
    return "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&auto=format&fit=crop&q=75";
  }

  // Handle Unsplash Images
  if (src.includes("images.unsplash.com")) {
    try {
      const url = new URL(src);
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", String(quality));
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      return url.toString();
    } catch {
      // Fallback manual regex replace
      return src
        .replace(/w=\d+/, `w=${width}`)
        .replace(/q=\d+/, `q=${quality}`)
        .concat(src.includes("auto=format") ? "" : "&auto=format");
    }
  }

  // Handle Cloudinary Images
  if (src.includes("res.cloudinary.com") && src.includes("/image/upload/")) {
    const transform = `c_scale,w_${width},q_auto,f_auto`;
    return src.replace("/image/upload/", `/image/upload/${transform}/`);
  }

  return src;
}
