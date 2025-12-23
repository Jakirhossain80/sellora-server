const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true, // ✅ minimal + safe: speeds up lookups by userName
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // ✅ minimal + safe: keeps emails consistent
      index: true, // ✅ minimal + safe: speeds up lookups by email
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
      trim: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
