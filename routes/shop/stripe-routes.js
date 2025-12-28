const express = require("express");
const {
  createCheckoutSession,
  verifyCheckoutSession,
} = require("../../controllers/shop/stripe-controller");

const router = express.Router();

// POST /api/shop/stripe/create-checkout-session
router.post("/create-checkout-session", createCheckoutSession);

// ✅ NEW: GET /api/shop/stripe/verify-session/:sessionId
router.get("/verify-session/:sessionId", verifyCheckoutSession);

module.exports = router;
