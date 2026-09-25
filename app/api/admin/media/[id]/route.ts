import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const success = await db.media.delete(id);
    if (!success) {
      // Also try finding by matching fileName or URL
      const data = db.get();
      let found = false;
      data.projects.forEach((p) => {
        const initialLen = p.gallery.length;
        p.gallery = p.gallery.filter((g) => g.id !== id && !g.url.includes(id));
        if (p.gallery.length !== initialLen) found = true;
      });
      if (!found) {
        return NextResponse.json({ success: false, error: 'Media not found' }, { status: 404 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully from database and project galleries.',
    });
  } catch (error: any) {
    console.error('[Admin Media DELETE] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
