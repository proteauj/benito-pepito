import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db/client';

export async function POST(request: NextRequest) {
  try {
    // Get client information
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    // Determine the real IP address
    const visitorIP = forwarded?.split(',')[0]?.trim() ||
                     realIP ||
                     request.headers.get('x-forwarded-for') ||
                     'unknown';

    // Get the page from the request body or query params
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'homepage';

    // Record the visit
    await prisma.pageVisit.create({
      data: {
        page: page,
        visitorIP: visitorIP,
        userAgent: userAgent || undefined,
      }
    });

    // Get visit count for the page
    const visitCount = await prisma.pageVisit.count({
      where: { page: page }
    });

    return NextResponse.json({
      success: true,
      page,
      visitCount,
      message: 'Visit recorded successfully'
    });

  } catch (error) {
    console.error('Error recording page visit:', error);
    return NextResponse.json(
      { error: 'Failed to record visit' },
      { status: 500 }
    );
  }
}
