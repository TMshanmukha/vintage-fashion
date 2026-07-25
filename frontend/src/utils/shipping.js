// Attempts to read a free-shipping threshold amount out of the storewide
// announcement text (e.g. "Free shipping on orders above ₹1999").
// This is a fragile approach — recommend adding a dedicated
// `free_shipping_threshold` column to website_settings when you get a chance.
// Keep this in sync with backend/services/checkout.service.js if you change either.

export const SHIPPING_FEE = 40; // ₹ — change this whenever you want a new flat rate
const DEFAULT_THRESHOLD = 999; // used if no number can be parsed from the announcement text

export function getFreeShippingThreshold(announcementText) {
  if (!announcementText) return DEFAULT_THRESHOLD;

  const match = announcementText.replace(/,/g, "").match(/(\d+(\.\d+)?)/);
  if (!match) return DEFAULT_THRESHOLD;

  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_THRESHOLD;
}

export function calculateShipping(subtotal, announcementText) {
  const threshold = getFreeShippingThreshold(announcementText);
  return subtotal >= threshold ? 0 : SHIPPING_FEE;
}
