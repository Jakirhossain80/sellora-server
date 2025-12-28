const express = require("express");

const {
  addToCart,
  fetchCartItems,
  deleteCartItem,
  updateCartItemQty,
  clearCart,
} = require("../../controllers/shop/cart-controller");

const router = express.Router();

const asyncHandler =
  (fn) =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.post("/add", asyncHandler(addToCart));
router.get("/get/:userId", asyncHandler(fetchCartItems));
router.put("/update-cart", asyncHandler(updateCartItemQty));

// ✅ IMPORTANT: place this BEFORE "/:userId/:productId"
router.delete("/clear/:userId", asyncHandler(clearCart));

router.delete("/:userId/:productId", asyncHandler(deleteCartItem));

module.exports = router;
