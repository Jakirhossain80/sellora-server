const mongoose = require("mongoose");

const FeatureSchema = new mongoose.Schema(
  {
    // ✅ Minimal + safe: keep type String, add trim to avoid accidental whitespace URLs
    image: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feature", FeatureSchema);
