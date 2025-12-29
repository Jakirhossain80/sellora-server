// server/api/index.js
require("dotenv").config();
const mongoose = require("mongoose");
const app = require("../app");

// ✅ In serverless, connect once and reuse the connection
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing in environment variables");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("✅ MongoDB connected (Vercel)");
  } catch (err) {
    console.error("❌ MongoDB connection error (Vercel):", err);
  }
}

// ✅ Ensure DB connection before handling requests
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
