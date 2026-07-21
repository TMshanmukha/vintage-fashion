import API from "./AdminApi";

// Public route from your product.routes.js: GET /api/products
// Pulls a big page so the marketing pickers have something to search through.
export const getProductsForPicker = () =>
    API.get("/products", { params: { page: 1, limit: 100 } });