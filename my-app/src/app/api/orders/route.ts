import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/db/service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
  }

  try {
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

    const order = await DatabaseService.createOrder({
      stripeSessionId,
      customerEmail,
      productIds,
      totalAmount,
      currency: currency || 'CAD',
      status: status || 'completed'
    });

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
