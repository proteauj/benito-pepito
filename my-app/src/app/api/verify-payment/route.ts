import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Extract product IDs from line items
      const productIds: string[] = [];

      if (session.line_items) {
        for (const item of session.line_items.data) {
          if (item.price?.product) {
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

      return NextResponse.json({
        success: true,
        sessionId,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency
      });
    } else {
      return NextResponse.json({
        success: false,
        sessionId,
        paymentStatus: session.payment_status,
        message: 'Payment not completed'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
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
