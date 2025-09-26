import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db/client';

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
        customerEmail: '', // Will be updated by webhook
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
