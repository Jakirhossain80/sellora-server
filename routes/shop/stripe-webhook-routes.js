const express = require("express");
const { stripeWebhook } = require("../../controllers/shop/stripe-webhook-controller");

const router = express.Router();

// IMPORTANT: raw body parser ONLY for Stripe webhook
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

module.exports = router;
