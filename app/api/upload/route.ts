import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyAdminSession } from '@/lib/auth';
import { processUploadedImage, processUploadedVideo } from '@/lib/mediaPipeline';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Session verification
    if (!verifyAdminSession(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Studio Desk access required.' },
        { status: 401 }
      );
    }

    // 2. Parse request (FormData or JSON)
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      const directUrl = body.directUrl || body.url;
      if (directUrl) {
        const originalName = body.originalName || body.fileName || 'asset';
        const mime = body.mimeType || (directUrl.endsWith('.mp4') ? 'video/mp4' : 'image/webp');
        const isVideo = mime.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(originalName);
        const asset = {
          fileName: originalName,
          originalName,
          mimeType: mime,
          fileSize: body.fileSize || 100000,
          url: directUrl,
          optimizedUrl: directUrl,
          thumbnailUrl: body.thumbnailUrl || directUrl,
          dimensions: body.dimensions || {
            width: 1920,
            height: 1080,
            aspectRatio: isVideo ? '16:9' : '16:10',
            orientation: 'horizontal',
            resolution: '1920x1080',
          },
          altText: body.altText || originalName.replace(/[_-]+/g, ' '),
          type: (isVideo ? 'video' : 'image') as any,
          projectId: body.projectId || null,
          categoryId: body.categoryId || null,
        };
        const saved = await db.media.create(asset as any);
        return NextResponse.json({
          success: true,
          message: 'Registered media asset from direct upload.',
          asset: saved,
          assets: [saved],
        });
      }
    }

    const formData = await request.formData();
    const projectId = (formData.get('projectId') as string) || null;
    const categoryId = (formData.get('categoryId') as string) || null;
    const directUrl = (formData.get('directUrl') as string) || (formData.get('url') as string);

    // Direct Supabase CDN registration (zero server payload)
    if (directUrl) {
      const originalName = (formData.get('fileName') as string) || 'asset';
      const mime = (formData.get('mimeType') as string) || (directUrl.endsWith('.mp4') ? 'video/mp4' : 'image/webp');
      const isVideo = mime.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(originalName);
      const width = Number(formData.get('width')) || 1920;
      const height = Number(formData.get('height')) || 1080;
      const asset = {
        fileName: originalName,
        originalName,
        mimeType: mime,
        fileSize: Number(formData.get('fileSize')) || 100000,
        url: directUrl,
        optimizedUrl: directUrl,
        thumbnailUrl: (formData.get('thumbnailUrl') as string) || directUrl,
        dimensions: {
          width,
          height,
          aspectRatio: (formData.get('aspectRatio') as string) || (isVideo ? '16:9' : '16:10'),
          orientation: ((formData.get('orientation') as string) || 'horizontal') as any,
          resolution: `${width}x${height}`,
        },
        altText: originalName.replace(/[_-]+/g, ' '),
        type: (isVideo ? 'video' : 'image') as any,
        projectId,
        categoryId,
      };
      const saved = await db.media.create(asset as any);
      return NextResponse.json({
        success: true,
        message: 'Registered media asset from direct upload.',
        asset: saved,
        assets: [saved],
      });
    }

    const files = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File;

    const uploadList: File[] = [];
    if (files && files.length > 0) {
      uploadList.push(...files);
    } else if (singleFile) {
      uploadList.push(singleFile);
    }

    if (!uploadList.length) {
      return NextResponse.json(
        { success: false, error: 'No files provided for upload.' },
        { status: 400 }
      );
    }

    const processedAssets = [];
    const seenHashes = new Set<string>();
    let duplicatesPurged = 0;

    for (const file of uploadList) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');

      // Duplicate detection: Purge/skip duplicate file if already in this batch
      if (seenHashes.has(fileHash)) {
        duplicatesPurged++;
        continue;
      }
      seenHashes.add(fileHash);

      const mime = file.type || 'application/octet-stream';
      const originalName = file.name || 'unnamed-asset';

      const isVideo = mime.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(originalName);

      if (isVideo) {
        const { asset } = await processUploadedVideo(buffer, originalName, mime, projectId, categoryId);
        const saved = await db.media.create(asset);
        processedAssets.push(saved);
      } else {
        const { asset } = await processUploadedImage(buffer, originalName, mime, projectId, categoryId);
        const saved = await db.media.create(asset);
        processedAssets.push(saved);
      }
    }

    const duplicateNote = duplicatesPurged > 0 ? ` Purged ${duplicatesPurged} duplicate asset(s).` : '';

    return NextResponse.json({
      success: true,
      message: `Successfully processed and converted ${processedAssets.length} asset(s) to lightweight web format.${duplicateNote}`,
      asset: processedAssets[0] || null,
      assets: processedAssets,
      duplicatesPurged,
    });
  } catch (error: any) {
    console.error('[Upload API] Error processing uploads:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Media processing error.' },
      { status: 500 }
    );
  }
}
