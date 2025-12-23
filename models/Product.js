const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    // ✅ Minimal + safe: keep same field types, add trim for cleaner strings
    image: { type: String, trim: true },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true, index: true }, // speeds up filtering
    brand: { type: String, trim: true, index: true }, // speeds up filtering
    price: { type: Number, default: 0 },
    salePrice: { type: Number, default: 0 },
    totalStock: { type: Number, default: 0 },
    averageReview: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
