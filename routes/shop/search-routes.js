const express = require("express");

const { searchProducts } = require("../../controllers/shop/search-controller");

const router = express.Router();

// ✅ Minimal + safe: wrap async handlers to avoid unhandled promise rejections
const asyncHandler =
  (fn) =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.get("/:keyword", asyncHandler(searchProducts));

module.exports = router;
