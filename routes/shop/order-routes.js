const express = require("express");

const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
} = require("../../controllers/shop/order-controller");

const router = express.Router();


const asyncHandler =
  (fn) =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.post("/create", asyncHandler(createOrder));
router.get("/list/:userId", asyncHandler(getAllOrdersByUser));
router.get("/details/:id", asyncHandler(getOrderDetails));

module.exports = router;
