import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    let event: Stripe.Event;

    try {
      if (!endpointSecret) {
        console.error('Missing STRIPE_WEBHOOK_SECRET');
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
      }

      event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;

        // Extract product IDs from line items
        const productIds: string[] = [];

        if (session.line_items) {
          for (const item of session.line_items.data) {
            if (item.price?.product) {
              // Get product metadata
              const product = await stripe.products.retrieve(item.price.product as string);
              if (product.metadata.productId) {
                productIds.push(product.metadata.productId);
              }
            }
          }
        }

        // Mark products as sold
        if (productIds.length > 0) {
          await updateProductsStock(productIds, false);
          console.log(`Marked ${productIds.length} products as sold after successful payment`);
        }

        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function updateProductsStock(productIds: string[], inStock: boolean) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productIds, inStock }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update products: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Products updated successfully:', result);
  } catch (error) {
    console.error('Error updating products stock:', error);
    throw error;
  }
}
