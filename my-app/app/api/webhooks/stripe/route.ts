import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

// Try to import database client - will fail in environments without database
let prisma: any = null;

try {
  const dbClientModule = require('../../../../lib/db/client');
  prisma = dbClientModule.prisma;
} catch (error) {
  console.log('Prisma client not available');
}

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

    // Skip if database not available
    if (!prisma) {
      console.log('⚠️ Database not available, skipping order save');
      return;
    }

    // Extract customer information from Stripe session
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name;

    // Extract billing address from Stripe session
    const billingAddress = session.customer_details?.address;
    const shippingAddress = (session as any).collected_information?.shipping_details?.address;

    console.log('🏠 Address data from Stripe:', { billingAddress: session.customer_details?.address, shippingAddress });

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
      await saveCustomerAddress(order.id, billingAddress || undefined, shippingAddress || undefined, customerEmail || '', session.id);
      console.log('✅ Customer addresses saved');
    } else {
      console.log('⚠️ No address data available from Stripe session');
    }
    // since we have the cart data in the URL

  } catch (error) {
    console.error('❌ Error saving order details:', error);
    throw error;
  }
}

async function saveCustomerAddress(orderId: string, billingAddress?: Stripe.Address, shippingAddress?: Stripe.Address, customerEmail?: string, sessionId?: string) {
  try {
    // Skip if database not available
    if (!prisma) {
      console.log('⚠️ Database not available, skipping address save');
      return;
    }

    // Check if addresses already exist for this session to prevent duplicates
    if (sessionId) {
      const existingOrder = await prisma.order.findUnique({
        where: { stripeSessionId: sessionId },
        include: {
          billingAddress: true,
          shippingAddress: true
        }
      });

      if (existingOrder) {
        // If addresses are already linked to this session, skip saving
        if (existingOrder.billingAddressId || existingOrder.shippingAddressId) {
          console.log('📍 Addresses already exist for this session, skipping save');
          return;
        }
      }
    }

    // Save billing address if available
    if (billingAddress) {
      console.log('💾 Saving billing address for order:', orderId);

      // Check if identical address already exists to avoid duplicates
      const existingBillingAddress = await findOrCreateAddress(billingAddress, 'billing', customerEmail);

      if (existingBillingAddress) {
        // Link existing address to order
        await prisma.order.update({
          where: { id: orderId },
          data: { billingAddressId: existingBillingAddress.id }
        });
        console.log('✅ Existing billing address linked successfully');
      } else {
        // Create new address
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

        // Link new address to order
        await prisma.order.update({
          where: { id: orderId },
          data: { billingAddressId: billingAddr.id }
        });

        console.log('✅ New billing address saved and linked successfully');
      }
    }

    // Save shipping address if available
    if (shippingAddress) {
      console.log('💾 Saving shipping address for order:', orderId);

      // Check if identical address already exists to avoid duplicates
      const existingShippingAddress = await findOrCreateAddress(shippingAddress, 'shipping', customerEmail);

      if (existingShippingAddress) {
        // Link existing address to order
        await prisma.order.update({
          where: { id: orderId },
          data: { shippingAddressId: existingShippingAddress.id }
        });
        console.log('✅ Existing shipping address linked successfully');
      } else {
        // Create new address
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

        // Link new address to order
        await prisma.order.update({
          where: { id: orderId },
          data: { shippingAddressId: shippingAddr.id }
        });

        console.log('✅ New shipping address saved and linked successfully');
      }
    }

  } catch (error) {
    console.error('Error saving customer address:', error);
    throw error;
  }
}

async function findOrCreateAddress(address: Stripe.Address, type: string, customerEmail?: string): Promise<any | null> {
  try {
    // Skip if database not available
    if (!prisma) {
      console.log('⚠️ Database not available, skipping address lookup');
      return null;
    }

    // Look for existing address with exact match
    const existingAddress = await prisma.customerAddress.findFirst({
      where: {
        type: type,
        line1: address.line1 || '',
        line2: address.line2 || null,
        city: address.city || '',
        state: address.state || null,
        postalCode: address.postal_code || '',
        country: address.country || '',
      }
    });

    if (existingAddress) {
      console.log('📍 Found existing address, reusing it');
      return existingAddress;
    }

    return null; // Address doesn't exist, will be created by caller

  } catch (error) {
    console.error('Error finding existing address:', error);
    return null;
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
