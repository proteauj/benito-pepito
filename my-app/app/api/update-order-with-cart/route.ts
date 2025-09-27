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

export async function POST(request: NextRequest) {
  try {
    const { sessionId, cartItems } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart items are required' }, { status: 400 });
    }

    console.log('🛒 Creating order with cart data:', { sessionId, cartItems });

    // Check if database is available
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    // Extract product IDs from cart items
    const productIds = cartItems.map((item: any) => item.id);

    // Calculate total from cart items
    const totalAmount = cartItems.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Check if order already exists
    const existingOrder = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId }
    });

    if (existingOrder) {
      console.log('📝 Order already exists, updating...');
      // Update existing order
      const updatedOrder = await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          productIds: productIds,
          totalAmount: Math.round(totalAmount),
        }
      });

      console.log('✅ Order updated with cart data:', {
        orderId: updatedOrder.id,
        productIds: productIds,
        totalAmount: totalAmount
      });

      // Update address information if available in Stripe session
      await updateAddressInformation(sessionId, updatedOrder.id);

      // Update product stock
      if (productIds.length > 0) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productIds, inStock: false }),
        });

        if (response.ok) {
          console.log('✅ Product stock updated');
        } else {
          console.error('❌ Failed to update product stock');
        }
      }

      return NextResponse.json({
        success: true,
        order: updatedOrder,
        updatedProducts: productIds.length
      });
    }

    // Create new order if it doesn't exist
    console.log('🆕 Creating new order...');
    const order = await prisma.order.create({
      data: {
        stripeSessionId: sessionId,
        customerEmail: '', // Will be updated by webhook or verify-payment
        productIds: productIds,
        totalAmount: Math.round(totalAmount),
        currency: 'CAD',
        status: 'completed',
      }
    });

    console.log('✅ Order created with cart data:', {
      orderId: order.id,
      sessionId: sessionId,
      productIds: productIds,
      totalAmount: totalAmount
    });

    // Update address information if available in Stripe session
    await updateAddressInformation(sessionId, order.id);

    // Update product stock
    if (productIds.length > 0) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/products`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds, inStock: false }),
      });

      if (response.ok) {
        console.log('✅ Product stock updated');
      } else {
        console.error('❌ Failed to update product stock');
      }
    }

    return NextResponse.json({
      success: true,
      order: order,
      created: true,
      updatedProducts: productIds.length
    });

  } catch (error) {
    console.error('❌ Error creating order with cart data:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

async function updateAddressInformation(sessionId: string, orderId: string) {
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
      await saveCustomerAddress(orderId, billingAddress || undefined, shippingAddress || undefined, sessionId);
      console.log('✅ Customer addresses saved');
    } else {
      console.log('⚠️ No address data available from Stripe session');
    }

  } catch (error) {
    console.error('❌ Error updating address information:', error);
    // Don't throw error to avoid breaking the order update flow
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
