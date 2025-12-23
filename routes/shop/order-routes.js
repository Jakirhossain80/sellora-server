const express = require("express");

const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  capturePayment,
} = require("../../controllers/shop/order-controller");

const router = express.Router();

// ✅ Minimal + safe: wrap async handlers to avoid unhandled promise rejections
const asyncHandler =
  (fn) =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.post("/create", asyncHandler(createOrder));
router.post("/capture", asyncHandler(capturePayment));
router.get("/list/:userId", asyncHandler(getAllOrdersByUser));
router.get("/details/:id", asyncHandler(getOrderDetails));

module.exports = router;
