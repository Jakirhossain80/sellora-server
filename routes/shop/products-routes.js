const express = require("express");

const {
  getFilteredProducts,
  getProductDetails,
} = require("../../controllers/shop/products-controller");

const router = express.Router();

// ✅ Minimal + safe: wrap async handlers to avoid unhandled promise rejections
const asyncHandler =
  (fn) =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// ✅ Existing routes (keep as-is)
// Pagination works via query params on this endpoint:
// GET /api/shop/products/get?page=1&limit=8&category=men,women&brand=nike&sortBy=price-lowtohigh
router.get("/get", asyncHandler(getFilteredProducts));
router.get("/get/:id", asyncHandler(getProductDetails));

module.exports = router;
