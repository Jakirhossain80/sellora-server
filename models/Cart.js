const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // ✅ minimal + safe: speeds up Cart.findOne({ userId })
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ✅ minimal + safe: ensure one cart per user (prevents duplicates, improves reliability)
CartSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model("Cart", CartSchema);
