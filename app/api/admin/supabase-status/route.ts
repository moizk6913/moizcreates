import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { checkSupabaseHealth, syncDatabaseToSupabase, fetchDatabaseFromSupabase } from '@/lib/supabaseClient';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const health = await checkSupabaseHealth();
    return NextResponse.json({
      success: true,
      ...health,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to check Supabase status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const currentDb = db.get();
    const synced = await syncDatabaseToSupabase(currentDb);
    const health = await checkSupabaseHealth();

    return NextResponse.json({
      success: synced,
      message: synced
        ? 'Successfully synced all portfolio data to Supabase Cloud!'
        : 'Could not sync yet. Ensure the portfolio_state table exists in Supabase.',
      ...health,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}
