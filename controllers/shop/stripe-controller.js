const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


exports.createCheckoutSession = async (req, res) => {
  try {
    const { cartItems, customerEmail } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Convert cart items to Stripe line_items
    const line_items = cartItems.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd", // Stripe does not support BDT
        unit_amount: Math.round(item.price * 100), // dollars → cents
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

      // Optional metadata (useful for webhook / debugging)
      metadata: {
        customerEmail: customerEmail || "",
        app: "sellora",
      },

      // Redirect URLs
      success_url: `${process.env.CLIENT_URL}/shop/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/shop/checkout`,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe session error:", error);
    return res
      .status(500)
      .json({ message: "Failed to create checkout session" });
  }
};


exports.verifyCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "sessionId is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const isPaid = session?.payment_status === "paid";

    return res.json({
      success: true,
      isPaid,
      paymentStatus: session?.payment_status,
      sessionId: session?.id,
    });
  } catch (error) {
    console.error("verifyCheckoutSession error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to verify session" });
  }
};
