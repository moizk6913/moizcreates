import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { orderMap } = body;

    if (!Array.isArray(orderMap) || !orderMap.length) {
      return NextResponse.json(
        { success: false, error: 'orderMap array is required.' },
        { status: 400 }
      );
    }

    await db.projects.reorder(orderMap);

    return NextResponse.json({
      success: true,
      message: 'Projects reordered successfully.',
    });
  } catch (error: any) {
    console.error('[Admin Projects Reorder] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
