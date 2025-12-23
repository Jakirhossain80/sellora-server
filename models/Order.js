const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    // ✅ Minimal + safe: keep existing types, add trim where strings are expected
    userId: { type: String, trim: true },
    cartId: { type: String, trim: true },

    cartItems: [
      {
        productId: { type: String, trim: true },
        title: { type: String, trim: true },
        image: { type: String, trim: true },
        price: { type: String, trim: true }, // kept as String to avoid breaking logic
        quantity: { type: Number },
      },
    ],

    addressInfo: {
      addressId: { type: String, trim: true },
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      pincode: { type: String, trim: true },
      phone: { type: String, trim: true },
      notes: { type: String, trim: true },
    },

    orderStatus: { type: String, trim: true },
    paymentMethod: { type: String, trim: true },
    paymentStatus: { type: String, trim: true },

    totalAmount: { type: Number },

    orderDate: { type: Date },
    orderUpdateDate: { type: Date },

    paymentId: { type: String, trim: true },
    payerId: { type: String, trim: true },
  },
  {
    timestamps: true, // ✅ minimal improvement: auto createdAt / updatedAt
  }
);

module.exports = mongoose.model("Order", OrderSchema);
