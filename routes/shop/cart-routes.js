const express = require("express");

const {
  addToCart,
  fetchCartItems,
  deleteCartItem,
  updateCartItemQty,
} = require("../../controllers/shop/cart-controller");

const router = express.Router();

// ✅ Minimal + safe: wrap async handlers to avoid unhandled promise rejections
const asyncHandler =
  (fn) =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.post("/add", asyncHandler(addToCart));
router.get("/get/:userId", asyncHandler(fetchCartItems));
router.put("/update-cart", asyncHandler(updateCartItemQty));
router.delete("/:userId/:productId", asyncHandler(deleteCartItem));

module.exports = router;
