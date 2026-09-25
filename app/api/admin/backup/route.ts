import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'create_snapshot') {
      const snapshot = await db.backup.createSnapshot();
      return NextResponse.json({ success: true, snapshot });
    }

    if (action === 'list') {
      const snapshots = await db.backup.listSnapshots();
      return NextResponse.json({ success: true, snapshots });
    }

    // Default: Export full database as JSON download
    const fullData = await db.backup.exportAll();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    return new NextResponse(JSON.stringify(fullData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="moiz-portfolio-backup-${timestamp}.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { jsonContent } = body;

    if (!jsonContent) {
      return NextResponse.json({ success: false, error: 'Backup jsonContent string is required.' }, { status: 400 });
    }

    await db.backup.restoreFromContent(jsonContent);

    return NextResponse.json({
      success: true,
      message: 'Portfolio database successfully restored from backup snapshot.',
    });
  } catch (error: any) {
    console.error('[Admin Backup Restore] Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Restoration failed' }, { status: 500 });
  }
}
