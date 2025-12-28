const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw body (Buffer)
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // ✅ Payment completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

   
      console.log("✅ checkout.session.completed:", session.id);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return res.status(500).json({ message: "Webhook handler failed" });
  }
};
