const express = require("express");
const { createCheckoutSession } = require("../../controllers/shop/stripe-controller");

const router = express.Router();

// POST /api/shop/stripe/create-checkout-session
router.post("/create-checkout-session", createCheckoutSession);

module.exports = router;
