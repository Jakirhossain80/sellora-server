const express = require("express");

const {
  addAddress,
  fetchAllAddress,
  editAddress,
  deleteAddress,
} = require("../../controllers/shop/address-controller");

const router = express.Router();

// ✅ Minimal + safe: wrap async handlers to avoid unhandled promise rejections
const asyncHandler =
  (fn) =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.post("/add", asyncHandler(addAddress));
router.get("/get/:userId", asyncHandler(fetchAllAddress));
router.delete("/delete/:userId/:addressId", asyncHandler(deleteAddress));
router.put("/update/:userId/:addressId", asyncHandler(editAddress));

module.exports = router;
