import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: Request) {
  try {
    const { items } = await request.json();
    // items: [{ id, name, price, quantity }]
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const line_items = items.map((it: any) => ({
      price_data: {
        currency: 'cad',
        product_data: { name: it.name },
        unit_amount: Math.round(Number(it.price) * 100),
      },
      quantity: Number(it.quantity) || 1,
    }));

    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/cancel`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe session error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
