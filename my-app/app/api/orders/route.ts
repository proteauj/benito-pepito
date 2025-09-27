import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Try to import database services - will fail in environments without database
let DatabaseService: any = null;
let prisma: any = null;

try {
  const dbModule = require('../../../lib/db/service');
  DatabaseService = dbModule.DatabaseService;
} catch (error) {
  console.log('DatabaseService not available');
}

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
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
  }

  try {
    // Check if database is available
    if (!DatabaseService) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const order = await DatabaseService.getOrderBySessionId(sessionId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stripeSessionId, customerEmail, productIds, totalAmount, currency, status } = body;

    if (!stripeSessionId || !productIds || !Array.isArray(productIds) || !totalAmount) {
      return NextResponse.json({
        error: 'Missing required fields: stripeSessionId, productIds, totalAmount'
      }, { status: 400 });
    }

    // Check if database is available
    if (!DatabaseService) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const order = await DatabaseService.createOrder({
      stripeSessionId,
      customerEmail,
      productIds,
      totalAmount,
      currency: currency || 'CAD',
      status: status || 'completed'
    });

    // Update address information if available in Stripe session
    await updateOrderAddressInformation(stripeSessionId, order.id);

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, status } = body;

    if (!sessionId || !status) {
      return NextResponse.json({
        error: 'Missing required fields: sessionId, status'
      }, { status: 400 });
    }

    // Check if database is available
    if (!DatabaseService) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const order = await DatabaseService.updateOrderStatus(sessionId, status);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

async function updateOrderAddressInformation(sessionId: string, orderId: string) {
  try {
    console.log('💾 Updating address information for session:', sessionId);

    // Skip if database not available
    if (!prisma) {
      console.log('⚠️ Database not available, skipping address update');
      return;
    }

    // Retrieve the session from Stripe to get address information
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Extract billing address from Stripe session
    const billingAddress = session.customer_details?.address;

    // Extract shipping address from Stripe session
    const shippingAddress = (session as any).collected_information?.shipping_details?.address;

    console.log('🏠 Address data from Stripe:', { billingAddress, shippingAddress });

    // Save customer address information if available
    if (billingAddress || shippingAddress) {
      await saveOrderAddress(orderId, billingAddress || undefined, shippingAddress || undefined, sessionId);
      console.log('✅ Customer addresses saved');
    } else {
      console.log('⚠️ No address data available from Stripe session');
    }

  } catch (error) {
    console.error('❌ Error updating address information:', error);
    // Don't throw error to avoid breaking the order creation flow
  }
}

async function saveOrderAddress(orderId: string, billingAddress?: Stripe.Address, shippingAddress?: Stripe.Address, sessionId?: string) {
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
    console.error('Error saving order address:', error);
    throw error;
  }
}
