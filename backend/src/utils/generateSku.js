export const generateSku = (productId) => {
    return `VF-${String(productId).padStart(6, "0")}`;
};

export const generateVariantSku = (
    productSku,
    color,
    size
) => {

    const colorCode = color
        ? color.substring(0, 3).toUpperCase()
        : "GEN";

    const sizeCode = size
        ? size.toUpperCase()
        : "STD";

    return `${productSku}-${colorCode}-${sizeCode}`;
};