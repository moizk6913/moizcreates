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

    // 2. Parse multipart form data
    const formData = await request.formData();
    const projectId = (formData.get('projectId') as string) || null;
    const categoryId = (formData.get('categoryId') as string) || null;

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
