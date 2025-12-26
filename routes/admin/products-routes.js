const express = require("express");

const {
  handleImageUpload,
  addProduct,
  editProduct,
  fetchAllProducts,
  deleteProduct,
} = require("../../controllers/admin/products-controller");

const { upload } = require("../../helpers/cloudinary");

const router = express.Router();

// ✅ Minimal + safe: wrap async handlers to avoid unhandled promise rejections
const asyncHandler =
  (fn) =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Upload image
router.post(
  "/upload-image",
  upload.single("my_file"),
  asyncHandler(handleImageUpload)
);

// CRUD
router.post("/add", asyncHandler(addProduct));
router.put("/edit/:id", asyncHandler(editProduct));
router.delete("/delete/:id", asyncHandler(deleteProduct));

// ✅ Pagination via query params (controller handles: ?page=1&limit=8)
// Example: GET /api/admin/products/get?page=1&limit=8
router.get("/get", asyncHandler(fetchAllProducts));

module.exports = router;
