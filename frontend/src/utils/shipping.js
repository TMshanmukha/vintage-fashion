// Free shipping threshold & capped shipping fee utility
export const SHIPPING_FEE = 49; // ₹ standard courier fee
export const CAPPED_SHIPPING_FEE = 89; // ₹ capped fee when courier exceeds ₹100
export const DEFAULT_THRESHOLD = 2000; // used if no number is specified in announcement

export function getFreeShippingThreshold(announcementText) {
  if (!announcementText) return DEFAULT_THRESHOLD;

  const match = announcementText.replace(/,/g, "").match(/(\d+(\.\d+)?)/);
  if (!match) return DEFAULT_THRESHOLD;

  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_THRESHOLD;
}

export function calculateShipping(subtotal, announcementText, baseShippingFee = 49) {
  const threshold = getFreeShippingThreshold(announcementText);
  if (Number(subtotal) >= threshold && threshold > 0) {
    return 0;
  }
  const fee = Number(baseShippingFee) || 49;
  return fee > 100 ? CAPPED_SHIPPING_FEE : fee;
}
