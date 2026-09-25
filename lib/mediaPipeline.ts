import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { execFile } from 'child_process';
import util from 'util';
import { MediaAsset, MediaDimensions } from './db/schema';

const execFileAsync = util.promisify(execFile);

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads');
const IMAGES_DIR = path.join(UPLOAD_ROOT, 'images');
const THUMBNAILS_DIR = path.join(UPLOAD_ROOT, 'thumbnails');
const VIDEOS_DIR = path.join(UPLOAD_ROOT, 'videos');
const ORIGINALS_DIR = path.join(UPLOAD_ROOT, 'originals');

function ensureUploadDirs() {
  [UPLOAD_ROOT, IMAGES_DIR, THUMBNAILS_DIR, VIDEOS_DIR, ORIGINALS_DIR].forEach((dir) => {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch {}
  });
}

function getFfmpegPath(): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ffmpegModule = require('ffmpeg-static');
    const p = typeof ffmpegModule === 'string' ? ffmpegModule : ffmpegModule?.default;
    if (p && typeof p === 'string' && fs.existsSync(p)) {
      return p;
    }
  } catch {}
  return null;
}

function calculateAspectRatio(w: number, h: number): { aspectRatio: string; orientation: MediaDimensions['orientation'] } {
  const ratio = w / h;
  let orientation: MediaDimensions['orientation'] = 'horizontal';

  if (h > w * 1.15) {
    orientation = 'vertical';
  } else if (w > h * 1.8) {
    orientation = 'panoramic';
  } else if (Math.abs(w - h) < Math.min(w, h) * 0.1) {
    orientation = 'square';
  } else {
    orientation = 'horizontal';
  }

  let aspectRatio = '16:10';
  if (Math.abs(ratio - 9 / 16) < 0.12) aspectRatio = '9:16';
  else if (Math.abs(ratio - 4 / 5) < 0.12) aspectRatio = '4:5';
  else if (Math.abs(ratio - 1) < 0.12) aspectRatio = '1:1';
  else if (Math.abs(ratio - 16 / 9) < 0.12) aspectRatio = '16:9';
  else if (Math.abs(ratio - 21 / 9) < 0.15) aspectRatio = '21:9';
  else if (Math.abs(ratio - 16 / 10) < 0.12) aspectRatio = '16:10';
  else aspectRatio = `${Math.round(ratio * 10) / 10}:1`;

  return { aspectRatio, orientation };
}

export interface ProcessMediaResult {
  asset: Omit<MediaAsset, 'id' | 'createdAt'>;
}

/**
 * AUTOMATIC IMAGE PIPELINE:
 * - Auto-orients based on EXIF
 * - Converts ANY image format (JPG, PNG, TIFF, BMP, HEIC) to WebP
 * - Bounds max dimensions to 2560px for pristine display quality without heavy payloads
 * - Creates a responsive 480px WebP thumbnail
 * - Strips unnecessary camera metadata to reduce size by 70%-90%
 */
export async function processUploadedImage(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string,
  projectId?: string | null,
  categoryId?: string | null
): Promise<ProcessMediaResult> {
  ensureUploadDirs();

  const fileHash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
  const ext = path.extname(originalFilename).toLowerCase() || '.jpg';
  const sanitizedBase = path
    .basename(originalFilename, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40) || 'media';

  const originalName = `${sanitizedBase}-${fileHash}${ext}`;
  const webpName = `${sanitizedBase}-${fileHash}.webp`;
  const thumbName = `${sanitizedBase}-${fileHash}-thumb.webp`;

  // 1. Read metadata via sharp with auto-rotation
  const image = sharp(buffer).rotate();
  const metadata = await image.metadata();

  const width = metadata.width || 1920;
  const height = metadata.height || 1080;
  const { aspectRatio, orientation } = calculateAspectRatio(width, height);

  let url = `/uploads/images/${webpName}`;
  let originalUrl = `/uploads/originals/${originalName}`;
  let optimizedUrl = `/uploads/images/${webpName}`;
  let thumbnailUrl = `/uploads/thumbnails/${thumbName}`;
  let fileSize = buffer.length;

  try {
    // 2. Save original securely on persistent disk
    const originalPath = path.join(ORIGINALS_DIR, originalName);
    fs.writeFileSync(originalPath, buffer);

    // 3. Generate high-quality master WebP (max 2560px bound)
    const optimizedPath = path.join(IMAGES_DIR, webpName);
    await sharp(buffer)
      .rotate()
      .resize({
        width: width > height ? Math.min(width, 2560) : undefined,
        height: height >= width ? Math.min(height, 2560) : undefined,
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: 84, effort: 4, smartSubsample: true })
      .toFile(optimizedPath);

    // 4. Generate responsive WebP thumbnail (max 480px bound)
    const thumbPath = path.join(THUMBNAILS_DIR, thumbName);
    await sharp(buffer)
      .rotate()
      .resize({
        width: width > height ? Math.min(width, 480) : undefined,
        height: height >= width ? Math.min(height, 480) : undefined,
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: 80, effort: 3 })
      .toFile(thumbPath);

    const optimizedStats = fs.statSync(optimizedPath);
    fileSize = optimizedStats.size;
  } catch (fsErr) {
    // Serverless read-only disk fallback (e.g. Vercel)
    try {
      const webpBuf = await sharp(buffer)
        .rotate()
        .resize({
          width: width > height ? Math.min(width, 2560) : undefined,
          height: height >= width ? Math.min(height, 2560) : undefined,
          withoutEnlargement: true,
          fit: 'inside',
        })
        .webp({ quality: 84 })
        .toBuffer();
      const dataUri = `data:image/webp;base64,${webpBuf.toString('base64')}`;
      url = dataUri;
      optimizedUrl = dataUri;
      originalUrl = dataUri;
      thumbnailUrl = dataUri;
      fileSize = webpBuf.length;
    } catch {}
  }

  return {
    asset: {
      fileName: webpName,
      originalName: originalFilename,
      mimeType: 'image/webp',
      fileSize,
      url,
      originalUrl,
      optimizedUrl,
      thumbnailUrl,
      dimensions: {
        width,
        height,
        aspectRatio,
        orientation,
        resolution: `${width}x${height}`,
      },
      altText: sanitizedBase.replace(/[_-]+/g, ' ').trim(),
      type: 'image',
      projectId: projectId || null,
      categoryId: categoryId || null,
    },
  };
}

/**
 * AUTOMATIC VIDEO CONVERTER & PIPELINE:
 * - Accepts ANY video (MP4, MOV, ProRes, WebM, iPhone HDR/HEVC)
 * - Transcodes to universal web-standard MP4 (H.264 / AAC)
 * - Enables "+faststart" (moves moov atom to start so video plays immediately without waiting to download)
 * - Caps resolution cleanly to 1080p with CRF 24 compression (80%-95% lighter than camera raw)
 * - Automatically generates a crystal-clear WebP poster and thumbnail frame
 */
export async function processUploadedVideo(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string,
  projectId?: string | null,
  categoryId?: string | null
): Promise<ProcessMediaResult> {
  ensureUploadDirs();

  const fileHash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
  const ext = path.extname(originalFilename).toLowerCase() || '.mp4';
  const sanitizedBase = path
    .basename(originalFilename, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40) || 'video';

  const rawOriginalName = `${sanitizedBase}-${fileHash}-raw${ext}`;
  const rawOriginalPath = path.join(ORIGINALS_DIR, rawOriginalName);
  fs.writeFileSync(rawOriginalPath, buffer);

  const ffmpeg = getFfmpegPath();
  const webpPosterName = `${sanitizedBase}-${fileHash}-poster.webp`;
  const webpThumbName = `${sanitizedBase}-${fileHash}-poster-thumb.webp`;
  const webpPosterPath = path.join(THUMBNAILS_DIR, webpPosterName);
  const webpThumbPath = path.join(THUMBNAILS_DIR, webpThumbName);

  const optimizedVideoName = `${sanitizedBase}-${fileHash}.mp4`;
  const optimizedVideoPath = path.join(VIDEOS_DIR, optimizedVideoName);

  let finalVideoPath = rawOriginalPath;
  let finalVideoUrl = `/uploads/originals/${rawOriginalName}`;
  const finalPosterUrl = `/uploads/thumbnails/${webpPosterName}`;
  const finalThumbUrl = `/uploads/thumbnails/${webpThumbName}`;
  let finalMimeType = mimeType;
  let finalFileSize = buffer.length;

  let width = 1920;
  let height = 1080;
  let duration = 10;
  let isVertical = /vertical|reel|story|9-16|9_16/i.test(originalFilename);

  if (ffmpeg) {
    try {
      // 1. Probe video metadata
      try {
        await execFileAsync(ffmpeg, ['-i', rawOriginalPath]);
      } catch (probeErr: any) {
        const errText = (probeErr?.stderr || '').toString();
        const durMatch = errText.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d+)/);
        if (durMatch) {
          const hours = parseInt(durMatch[1], 10);
          const minutes = parseInt(durMatch[2], 10);
          const seconds = parseFloat(durMatch[3]);
          duration = Math.max(1, Math.round(hours * 3600 + minutes * 60 + seconds));
        }
        const resMatch = errText.match(/Stream.*Video:.* (\d{3,4})x(\d{3,4})/);
        if (resMatch) {
          width = parseInt(resMatch[1], 10);
          height = parseInt(resMatch[2], 10);
          isVertical = height > width * 1.1;
        }
      }

      // 2. Extract crystal-clear WebP Poster frame
      const seekSec = Math.min(1.0, Math.max(0.1, duration / 4));
      const seekTime = `00:00:0${seekSec.toFixed(3)}`;

      await execFileAsync(ffmpeg, [
        '-loglevel', 'error',
        '-ss', seekTime,
        '-i', rawOriginalPath,
        '-vframes', '1',
        '-update', '1',
        '-vf', `scale='min(${isVertical ? 1080 : 1920},iw)':-2`,
        webpPosterPath,
        '-y',
      ], { maxBuffer: 50 * 1024 * 1024 });

      await execFileAsync(ffmpeg, [
        '-loglevel', 'error',
        '-ss', seekTime,
        '-i', rawOriginalPath,
        '-vframes', '1',
        '-update', '1',
        '-vf', `scale='min(480,iw)':-2`,
        webpThumbPath,
        '-y',
      ], { maxBuffer: 50 * 1024 * 1024 });

      // 3. Transcode to Web-Optimized MP4 (Universal H.264 / YUV420p, AAC, +faststart)
      const maxDim = isVertical ? 1080 : 1920;
      await execFileAsync(ffmpeg, [
        '-loglevel', 'error',
        '-i', rawOriginalPath,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'fast',
        '-crf', '24',
        '-vf', `scale='min(${maxDim},iw)':-2`,
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        optimizedVideoPath,
        '-y',
      ], { maxBuffer: 50 * 1024 * 1024 });

      if (fs.existsSync(optimizedVideoPath)) {
        const stats = fs.statSync(optimizedVideoPath);
        finalVideoPath = optimizedVideoPath;
        finalVideoUrl = `/uploads/videos/${optimizedVideoName}`;
        finalFileSize = stats.size;
        finalMimeType = 'video/mp4';
      }
    } catch (ffmpegErr) {
      console.warn('[Video Pipeline] FFmpeg transcoding fallback:', ffmpegErr);
      const fallbackVideoPath = path.join(VIDEOS_DIR, `${sanitizedBase}-${fileHash}${ext}`);
      if (!fs.existsSync(fallbackVideoPath)) {
        fs.writeFileSync(fallbackVideoPath, buffer);
      }
      finalVideoPath = fallbackVideoPath;
      finalVideoUrl = `/uploads/videos/${sanitizedBase}-${fileHash}${ext}`;
    }
  } else {
    const fallbackVideoPath = path.join(VIDEOS_DIR, `${sanitizedBase}-${fileHash}${ext}`);
    if (!fs.existsSync(fallbackVideoPath)) {
      fs.writeFileSync(fallbackVideoPath, buffer);
    }
    finalVideoPath = fallbackVideoPath;
    finalVideoUrl = `/uploads/videos/${sanitizedBase}-${fileHash}${ext}`;
  }

  const { aspectRatio, orientation } = calculateAspectRatio(width, height);

  return {
    asset: {
      fileName: path.basename(finalVideoPath),
      originalName: originalFilename,
      mimeType: finalMimeType,
      fileSize: finalFileSize,
      url: finalVideoUrl,
      originalUrl: `/uploads/originals/${rawOriginalName}`,
      optimizedUrl: finalVideoUrl,
      thumbnailUrl: fs.existsSync(webpPosterPath) ? finalPosterUrl : (fs.existsSync(webpThumbPath) ? finalThumbUrl : finalVideoUrl),
      dimensions: {
        width,
        height,
        aspectRatio,
        orientation,
        duration,
        resolution: `${width}x${height}`,
      },
      altText: sanitizedBase.replace(/[_-]+/g, ' ').trim(),
      type: 'video',
      projectId: projectId || null,
      categoryId: categoryId || null,
    },
  };
}
