import { NextRequest, NextResponse } from 'next/server';

// Try to import database client - will fail in environments without database
let prisma: any = null;

try {
  const dbClientModule = require('../../../../lib/db/client');
  prisma = dbClientModule.prisma;
} catch (error) {
  console.log('Prisma client not available');
}

export async function GET(request: NextRequest) {
  try {
    // Check if database is available
    if (!prisma) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'homepage';

    // Get total visits for the page
    const totalVisits = await prisma.pageVisit.count({
      where: { page: page }
    });

    // Get visits for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVisits = await prisma.pageVisit.count({
      where: {
        page: page,
        visitedAt: {
          gte: today
        }
      }
    });

    // Get visits for this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekVisits = await prisma.pageVisit.count({
      where: {
        page: page,
        visitedAt: {
          gte: weekAgo
        }
      }
    });

    // Get visits for this month
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const monthVisits = await prisma.pageVisit.count({
      where: {
        page: page,
        visitedAt: {
          gte: monthAgo
        }
      }
    });

    // Get unique visitors (approximate, based on IP)
    const uniqueVisitors = await prisma.pageVisit.findMany({
      where: { page: page },
      select: { visitorIP: true },
      distinct: ['visitorIP']
    });

    return NextResponse.json({
      page,
      totalVisits,
      todayVisits,
      weekVisits,
      monthVisits,
      uniqueVisitors: uniqueVisitors.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
