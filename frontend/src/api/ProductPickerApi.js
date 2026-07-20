import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true
});

// Public route from your product.routes.js: GET /api/products
// Pulls a big page so the marketing pickers have something to search through.
export const getProductsForPicker = () =>
  API.get("/products", { params: { page: 1, limit: 100 } });