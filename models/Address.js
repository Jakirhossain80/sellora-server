const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    // ✅ Minimal + safe: keep field types the same, add trimming to reduce messy data
    userId: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    pincode: { type: String, trim: true },
    phone: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Address", AddressSchema);
