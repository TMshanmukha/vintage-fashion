/**
 * Image Optimization Helper
 * Automatically transforms Unsplash, Cloudinary, and local image URLs
 * to optimal sizes, compression, and modern formats (WebP/AVIF) for Lighthouse 100 performance.
 */
const BROKEN_UNSPLASH_ID = "photo-1542272604-780c96856592";
const WORKING_FALLBACK_URL = "https://images.unsplash.com/photo-1541099649105-f69ad21f3246";

export function getOptimizedImageUrl(src, width = 300, quality = 70) {
  if (!src || typeof src !== "string") {
    return `https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=${width}&auto=format&fit=crop&q=${quality}`;
  }

  let cleanSrc = src;
  if (cleanSrc.includes(BROKEN_UNSPLASH_ID)) {
    cleanSrc = WORKING_FALLBACK_URL;
  }

  // Handle Unsplash Images
  if (cleanSrc.includes("images.unsplash.com")) {
    try {
      const url = new URL(cleanSrc);
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", String(quality));
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      return url.toString();
    } catch {
      return cleanSrc
        .replace(/w=\d+/, `w=${width}`)
        .replace(/q=\d+/, `q=${quality}`)
        .concat(cleanSrc.includes("auto=format") ? "" : "&auto=format");
    }
  }

  // Handle Cloudinary Images
  if (cleanSrc.includes("res.cloudinary.com") && cleanSrc.includes("/image/upload/")) {
    const transform = `c_scale,w_${width},q_auto,f_auto`;
    return cleanSrc.replace("/image/upload/", `/image/upload/${transform}/`);
  }

  return cleanSrc;
}

export function getResponsiveImageSrcSet(src, widths = [320, 640, 960, 1200], quality = 70) {
  if (!src || typeof src !== "string") return "";
  return widths
    .map((w) => `${getOptimizedImageUrl(src, w, quality)} ${w}w`)
    .join(", ");
}
