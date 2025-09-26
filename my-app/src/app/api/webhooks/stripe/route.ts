
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '../../../../../lib/db/client';

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

        // Extract and save order details
        await saveOrderDetails(session);
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

async function saveOrderDetails(session: Stripe.Checkout.Session) {
  try {
    console.log('💾 Saving order details for session:', session.id);

    // Get cart data from URL (simplified approach)
    const productIds: string[] = [];
    const itemsData: any[] = [];

    console.log('📋 Session data:', {
      customer_details: session.customer_details,
      shipping_details: (session as any).shipping_details,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status
    });

    // Extract customer information
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name;

    // Extract billing address
    const billingAddress = session.customer_details?.address;

    // Extract shipping address
    const shippingAddress = (session as any).shipping_details?.address;

    console.log('🏠 Address data:', { billingAddress, shippingAddress });

    // Extract line items and try to get product IDs
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    console.log('🛒 Line items:', lineItems.data.length);

    for (const item of lineItems.data) {
      console.log('Processing line item:', {
        priceId: item.price?.id,
        quantity: item.quantity,
        amount: item.amount_total
      });

      // Try to get product ID from price metadata
      if (item.price?.id) {
        try {
          const price = await stripe.prices.retrieve(item.price.id);

          if (price.product && typeof price.product === 'string') {
            const product = await stripe.products.retrieve(price.product);

            // Try to get productId from metadata
            const productId = product.metadata?.productId;
            if (productId) {
              productIds.push(productId);
              console.log('✅ Found productId from Stripe metadata:', productId);
            } else {
              // Fallback: use product name as identifier for now
              console.log('⚠️ No productId metadata, using product name as fallback');
              // For now, we'll create a temporary ID based on product name
              // In production, you'd want to ensure all products have proper metadata
            }
          }
        } catch (error) {
          console.error('❌ Error retrieving product metadata:', error);
        }
      }
    }

    console.log('📊 Final product IDs:', productIds);

    // Calculate total amount
    const totalAmount = session.amount_total ? session.amount_total / 100 : 0;

    // Save order to database
    const order = await prisma.order.create({
      data: {
        stripeSessionId: session.id,
        customerEmail: customerEmail || '',
        productIds: productIds,
        totalAmount: Math.round(totalAmount),
        currency: session.currency || 'CAD',
        status: 'completed',
      }
    });

    console.log('✅ Order saved successfully:', {
      orderId: order.id,
      sessionId: session.id,
      email: customerEmail,
      productCount: productIds.length,
      totalAmount
    });

    // Save customer address information
    if (billingAddress || shippingAddress) {
      await saveCustomerAddress(order.id, billingAddress || undefined, shippingAddress || undefined);
    } else {
      console.log('⚠️ No address data to save');
    }

    // Mark products as sold (only if we have product IDs)
    if (productIds.length > 0) {
      await updateProductsStock(productIds, false);
      console.log(`✅ Marked ${productIds.length} products as sold`);
    } else {
      console.log('⚠️ No products to mark as sold - missing Stripe metadata');
    }

  } catch (error) {
    console.error('❌ Error saving order details:', error);
    throw error;
  }
}

async function saveCustomerAddress(orderId: string, billingAddress?: Stripe.Address, shippingAddress?: Stripe.Address) {
  try {
    // Save billing address if available
    if (billingAddress) {
      console.log('💾 Saving billing address for order:', orderId);

      const billingAddr = await prisma.customerAddress.create({
        data: {
          type: 'billing',
          line1: billingAddress.line1 || '',
          line2: billingAddress.line2 || null,
          city: billingAddress.city || '',
          state: billingAddress.state || null,
          postalCode: billingAddress.postal_code || '',
          country: billingAddress.country || '',
        }
      });

      // Link billing address to order
      await prisma.order.update({
        where: { id: orderId },
        data: { billingAddressId: billingAddr.id }
      });

      console.log('✅ Billing address saved and linked successfully');
    }

    // Save shipping address if available
    if (shippingAddress) {
      console.log('💾 Saving shipping address for order:', orderId);

      const shippingAddr = await prisma.customerAddress.create({
        data: {
          type: 'shipping',
          line1: shippingAddress.line1 || '',
          line2: shippingAddress.line2 || null,
          city: shippingAddress.city || '',
          state: shippingAddress.state || null,
          postalCode: shippingAddress.postal_code || '',
          country: shippingAddress.country || '',
        }
      });

      // Link shipping address to order
      await prisma.order.update({
        where: { id: orderId },
        data: { shippingAddressId: shippingAddr.id }
      });

      console.log('✅ Shipping address saved and linked successfully');
    }

  } catch (error) {
    console.error('Error saving customer address:', error);
    throw error;
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
