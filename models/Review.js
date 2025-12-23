const mongoose = require("mongoose");

const ProductReviewSchema = new mongoose.Schema(
  {
    // ✅ Minimal + safe: keep types the same, add trim for cleaner stored values
    productId: { type: String, trim: true, index: true }, // helps lookups by productId
    userId: { type: String, trim: true, index: true }, // helps lookups by userId
    userName: { type: String, trim: true },
    reviewMessage: { type: String, trim: true },
    reviewValue: { type: Number },
  },
  { timestamps: true }
);

// ✅ Minimal + safe: prevent duplicate reviews per (productId, userId)
ProductReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("ProductReview", ProductReviewSchema);
