import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Try to import database client - will fail in environments without database
let prisma: any = null;

try {
  const dbClientModule = require('../../../lib/db/client');
  prisma = dbClientModule.prisma;
} catch (error) {
  console.log('Prisma client not available');
}

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

    // Check if Stripe key is available
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        error: 'Stripe secret key not configured'
      }, { status: 500 });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Save address information if available
      await saveAddressInformation(sessionId, session);

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

async function saveAddressInformation(sessionId: string, session: Stripe.Checkout.Session) {
  try {
    console.log('💾 Saving address information for session:', sessionId);

    // Skip if database not available
    if (!prisma) {
      console.log('⚠️ Database not available, skipping address save');
      return;
    }

    // Extract customer email from Stripe session
    const customerEmail = session.customer_details?.email;

    // Extract billing address from Stripe session
    const billingAddress = session.customer_details?.address;

    // Extract shipping address from Stripe session
    const shippingAddress = (session as any).collected_information?.shipping_details?.address;

    // Check if order already exists
    const existingOrder = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId }
    });

    if (existingOrder) {
      // Update customer email if it's missing
      if (!existingOrder.customerEmail && customerEmail) {
        await prisma.order.update({
          where: { id: existingOrder.id },
          data: { customerEmail: customerEmail }
        });
        console.log('✅ Customer email updated in existing order');
      }

      // Save customer address information
      if (billingAddress || shippingAddress) {
        await saveCustomerAddress(existingOrder.id, billingAddress || undefined, shippingAddress || undefined, sessionId);
        console.log('✅ Customer addresses saved');
      } else {
        console.log('⚠️ No address data available from Stripe session');
      }
    } else {
      console.log('⚠️ No existing order found for session:', sessionId);
    }

  } catch (error) {
    console.error('❌ Error saving address information:', error);
    // Don't throw error to avoid breaking the payment verification flow
  }
}

async function saveCustomerAddress(orderId: string, billingAddress?: Stripe.Address, shippingAddress?: Stripe.Address, sessionId?: string) {
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
