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

router.post(
  "/upload-image",
  upload.single("my_file"),
  asyncHandler(handleImageUpload)
);
router.post("/add", asyncHandler(addProduct));
router.put("/edit/:id", asyncHandler(editProduct));
router.delete("/delete/:id", asyncHandler(deleteProduct));
router.get("/get", asyncHandler(fetchAllProducts));

module.exports = router;
