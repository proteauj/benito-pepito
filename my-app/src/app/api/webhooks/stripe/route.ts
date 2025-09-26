
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
    console.log('🎣 Webhook Stripe appelé !');
    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    console.log('📋 Headers reçus:', Object.fromEntries(headersList.entries()));
    console.log('📋 Signature Stripe:', sig ? 'présente' : 'absente');

    let event: Stripe.Event;

    try {
      if (!endpointSecret) {
        console.error('❌ STRIPE_WEBHOOK_SECRET manquante');
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
      }

      event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
      console.log('✅ Webhook signature vérifiée avec succès');
    } catch (err: any) {
      console.error('❌ Erreur de vérification de signature:', err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    console.log('📬 Événement reçu:', event.type, event.id);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('🛒 Checkout session completed !');
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('📋 Session ID:', session.id);

        // Extract and save order details
        await saveOrderDetails(session);
        break;

      default:
        console.log(`📭 Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Erreur webhook générale:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function saveOrderDetails(session: Stripe.Checkout.Session) {
  try {
    console.log('💾 Saving order details for session:', session.id);

    // Extract customer information from Stripe session
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name;

    // Extract billing address from Stripe session
    const billingAddress = session.customer_details?.address;

    // Extract shipping address from Stripe session
    const shippingAddress = (session as any).shipping_details?.address;

    console.log('🏠 Address data from Stripe:', { billingAddress, shippingAddress });

    // Calculate total amount from Stripe session
    const totalAmount = session.amount_total ? session.amount_total / 100 : 0;

    // For now, we'll create the order without product IDs
    // The product stock update will be handled separately
    const order = await prisma.order.create({
      data: {
        stripeSessionId: session.id,
        customerEmail: customerEmail || '',
        productIds: [], // Empty for now - will be populated from cart data
        totalAmount: Math.round(totalAmount),
        currency: session.currency || 'CAD',
        status: 'completed',
      }
    });

    console.log('✅ Order created successfully:', {
      orderId: order.id,
      sessionId: session.id,
      email: customerEmail,
      totalAmount
    });

    // Save customer address information
    if (billingAddress || shippingAddress) {
      await saveCustomerAddress(order.id, billingAddress || undefined, shippingAddress || undefined);
      console.log('✅ Customer addresses saved');
    } else {
      console.log('⚠️ No address data available from Stripe session');
    }

    // Note: Product stock update will be handled via the success page
    // since we have the cart data in the URL

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
