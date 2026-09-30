import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { MediaAsset } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId') || undefined;

    const mediaList = await db.media.getAll(projectId);
    const projects = await db.projects.getAll();

    return NextResponse.json({
      success: true,
      count: mediaList.length,
      media: mediaList,
      projects,
    });
  } catch (error: any) {
    console.error('[Admin Works GET] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    let rawItems: any[] = [];

    if (Array.isArray(body)) {
      rawItems = body;
    } else if (Array.isArray(body.works)) {
      rawItems = body.works;
    } else if (body.work) {
      rawItems = [body.work];
    } else if (body.mediaUrl || body.url) {
      rawItems = [body];
    }

    if (!rawItems.length) {
      return NextResponse.json({ success: false, error: 'No works provided' }, { status: 400 });
    }

    const assetsToUpsert: Array<Omit<MediaAsset, 'createdAt'> & { createdAt?: string }> = rawItems.map((w: any) => {
      const url = w.mediaUrl || w.url || '';
      const isVideo = w.mediaType === 'video' || url.endsWith('.mp4') || (w.fileType && w.fileType.startsWith('video/'));
      const originalName = w.fileName || w.originalName || w.title || 'asset';

      return {
        id: w.id || `work-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        fileName: originalName,
        originalName,
        mimeType: w.fileType || (isVideo ? 'video/mp4' : 'image/webp'),
        fileSize: w.fileSize || 100000,
        url,
        optimizedUrl: w.optimizedUrl || url,
        thumbnailUrl: w.thumbnailUrl || url,
        dimensions: w.dimensions || {
          width: 1920,
          height: 1080,
          aspectRatio: isVideo ? '16:9' : '4:5',
          orientation: isVideo ? 'horizontal' : 'vertical',
        },
        altText: w.title || originalName,
        type: isVideo ? 'video' : 'image',
        projectId: w.projectId || null,
        categoryId: w.categoryId || null,
        createdAt: w.createdAt ? (typeof w.createdAt === 'number' ? new Date(w.createdAt).toISOString() : w.createdAt) : undefined,
      };
    });

    const saved = await db.media.batchUpsert(assetsToUpsert);

    return NextResponse.json({
      success: true,
      message: `Persisted ${saved.length} work(s) to database & Supabase Cloud.`,
      count: saved.length,
      works: saved,
    });
  } catch (error: any) {
    console.error('[Admin Works POST] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get('id');

    let idsToDelete: string[] = [];
    if (queryId) {
      idsToDelete.push(queryId);
    } else {
      const body = await request.json().catch(() => ({}));
      if (Array.isArray(body.ids)) {
        idsToDelete = body.ids;
      } else if (body.id) {
        idsToDelete = [body.id];
      }
    }

    if (!idsToDelete.length) {
      return NextResponse.json({ success: false, error: 'No work ID provided for deletion' }, { status: 400 });
    }

    for (const id of idsToDelete) {
      await db.media.delete(id);
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${idsToDelete.length} work(s) from database & Supabase Cloud.`,
    });
  } catch (error: any) {
    console.error('[Admin Works DELETE] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
