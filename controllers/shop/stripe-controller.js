const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const { cartItems, customerEmail, shippingAddress } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Convert your cart items to Stripe line_items
    const line_items = cartItems.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd", // change if needed (bdt not supported by Stripe)
        unit_amount: Math.round(item.price * 100), // dollars -> cents
        product_data: {
          name: item.title,
          images: item.image ? [item.image] : [],
        },
      },
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customerEmail,

      line_items,

      // OPTIONAL: store useful info in metadata
      metadata: {
        customerEmail: customerEmail || "",
      },

      // Redirect URLs
      success_url: `${process.env.CLIENT_URL}/shopping/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/shopping/checkout?canceled=true`,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe session error:", error);
    return res.status(500).json({ message: "Failed to create checkout session" });
  }
};
