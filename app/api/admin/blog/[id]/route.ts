import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await db.blog.update(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Article not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, post: updated });
  } catch (error: any) {
    console.error('[Admin Blog PATCH] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const success = await db.blog.delete(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Article not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Article deleted successfully.' });
  } catch (error: any) {
    console.error('[Admin Blog DELETE] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
