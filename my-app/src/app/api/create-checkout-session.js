// pages/api/create-checkout-session.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");
  try {
    const { items } = req.body; // [{id, name, price, quantity}]
    const line_items = items.map(it => ({
      price_data: {
        currency: "cad",
        product_data: { name: it.name },
        unit_amount: Math.round(it.price * 100), // montant en cents
      },
      quantity: it.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["CA"]
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
      // optional: metadata, shipping, customer_email, etc.
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
