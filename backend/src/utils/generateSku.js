export const generateSku = (productId) => {
    return `VF-${String(productId).padStart(6, "0")}`;
};

export const generateVariantSku = (
    productSku,
    color,
    size
) => {
    const colorClean = (color || "").toString().trim().replace(/[^a-zA-Z0-9]/g, "");
    const colorCode = colorClean
        ? colorClean.substring(0, 4).toUpperCase()
        : "GEN";

    const sizeClean = (size || "").toString().trim().replace(/[^a-zA-Z0-9]/g, "");
    const sizeCode = sizeClean
        ? sizeClean.substring(0, 8).toUpperCase()
        : "STD";

    return `${productSku}-${colorCode}-${sizeCode}`;
};