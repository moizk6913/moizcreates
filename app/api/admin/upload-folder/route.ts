import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyAdminSession } from '@/lib/auth';
import { processUploadedImage, processUploadedVideo } from '@/lib/mediaPipeline';
import { db } from '@/lib/db';
import { MediaAsset, ProjectSection, ProjectSectionType, VideoAsset } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

function inferSectionType(subfolderName: string): ProjectSectionType {
  const norm = subfolderName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (norm.includes('banner') || norm.includes('billboard') || norm.includes('header') || norm.includes('standee')) {
    return 'banner';
  }
  if (norm.includes('storie') || norm.includes('story') || norm.includes('reel') || norm.includes('916') || norm.includes('tiktok')) {
    return 'stories';
  }
  if (norm.includes('deck') || norm.includes('presentation') || norm.includes('pitch') || norm.includes('slide')) {
    return 'deck';
  }
  if (norm.includes('video') || norm.includes('film') || norm.includes('motion') || norm.includes('teaser')) {
    return 'video';
  }
  if (norm.includes('catalog') || norm.includes('lookbook') || norm.includes('editorial') || norm.includes('shoot')) {
    return 'lookbook';
  }
  return 'grid';
}

function formatSectionTitle(raw: string): string {
  return raw
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || 'Deliverables';
}

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
    const files = formData.getAll('files') as File[];
    const paths = formData.getAll('paths') as string[];
    const customTitle = (formData.get('title') as string) || '';
    const customClient = (formData.get('client') as string) || '';
    const customYear = (formData.get('year') as string) || new Date().getFullYear().toString();
    const customRole = (formData.get('role') as string) || 'Director of Visuals';
    const customCategory = (formData.get('categoryId') as string) || 'art-direction';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided in project folder upload.' },
        { status: 400 }
      );
    }

    // 3. Determine project title from root folder
    let inferredTitle = customTitle.trim();
    if (!inferredTitle && paths.length > 0) {
      const firstParts = paths[0].split(/[/\\]/);
      if (firstParts.length > 1) {
        inferredTitle = firstParts[0]
          .replace(/[-_]+/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .trim();
      }
    }
    if (!inferredTitle) {
      inferredTitle = 'New Directorial Project';
    }

    const slug = inferredTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // 4. Group files by subfolder/section
    interface StagedFile {
      file: File;
      subfolder: string;
      fileName: string;
    }

    const sectionMap = new Map<string, StagedFile[]>();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relPath = paths[i] || file.name;
      const parts = relPath.split(/[/\\]/).filter(Boolean);

      let subfolder = 'general';
      let fileName = file.name;

      if (parts.length >= 3) {
        // e.g. KALADHAR / catalog / look1.jpg
        subfolder = parts[1];
        fileName = parts.slice(2).join('_');
      } else if (parts.length === 2) {
        // e.g. KALADHAR / image.jpg OR catalog / image.jpg
        if (parts[0].toLowerCase() === inferredTitle.toLowerCase()) {
          subfolder = 'general';
        } else {
          subfolder = parts[0];
        }
        fileName = parts[1];
      }

      if (!sectionMap.has(subfolder)) {
        sectionMap.set(subfolder, []);
      }
      sectionMap.get(subfolder)!.push({ file, subfolder, fileName });
    }

    // 5. Duplicate Detection & Media Processing Pipeline
    const seenHashes = new Set<string>();
    let duplicatesPurged = 0;

    const projectSections: ProjectSection[] = [];
    const allGalleryAssets: MediaAsset[] = [];
    const allVideoAssets: VideoAsset[] = [];

    let displayOrder = 1;

    for (const [subfolderKey, fileItems] of sectionMap.entries()) {
      const sectionType = inferSectionType(subfolderKey);
      const sectionTitle = formatSectionTitle(subfolderKey);
      const sectionItems: MediaAsset[] = [];

      for (const item of fileItems) {
        const buffer = Buffer.from(await item.file.arrayBuffer());
        const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');

        // Automatic Duplicate Purging: If identical binary hash exists in upload, delete/skip it
        if (seenHashes.has(fileHash)) {
          duplicatesPurged++;
          continue;
        }
        seenHashes.add(fileHash);

        const mime = item.file.type || 'application/octet-stream';
        const isVideo = mime.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(item.fileName);

        if (isVideo) {
          const { asset } = await processUploadedVideo(
            buffer,
            item.fileName,
            mime,
            slug,
            customCategory
          );
          const saved = await db.media.create(asset);
          sectionItems.push(saved);
          allVideoAssets.push({
            id: `vid-${saved.id}`,
            url: saved.url,
            posterUrl: saved.thumbnailUrl || saved.optimizedUrl,
            duration: saved.dimensions.duration || 15,
            dimensions: saved.dimensions,
            type: 'direct',
            title: saved.altText,
          });
        } else {
          const { asset } = await processUploadedImage(
            buffer,
            item.fileName,
            mime,
            slug,
            customCategory
          );
          const saved = await db.media.create(asset);
          sectionItems.push(saved);
          allGalleryAssets.push(saved);
        }
      }

      if (sectionItems.length > 0) {
        projectSections.push({
          id: `sec-${subfolderKey.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          title: sectionTitle,
          type: sectionType,
          items: sectionItems,
          displayOrder: displayOrder++,
        });
      }
    }

    // 6. Intelligent Bento Key Visual Auto-Curation ("Make Bento Fine")
    // Identify the best wide banner for the primary key visual (16:9 or 21:9)
    // Identify the best vertical lookbook for the secondary visual (4:5 or 9:16)
    const bannerSection = projectSections.find((s) => s.type === 'banner');
    const lookbookSection = projectSections.find((s) => s.type === 'lookbook');
    const storiesSection = projectSections.find((s) => s.type === 'stories');

    const coverAsset =
      bannerSection?.items[0] ||
      allGalleryAssets[0] ||
      (allVideoAssets[0] ? { url: allVideoAssets[0].posterUrl || '' } : null);

    const coverImageUrl =
      coverAsset?.url ||
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80';

    // 7. Save project in DB
    const existing = await db.projects.getBySlug(slug);
    let finalProject;

    if (existing) {
      // Intelligently merge sections rather than blindly appending
      const mergedSections: ProjectSection[] = [...(existing.sections || [])];
      for (const newSec of projectSections) {
        const found = mergedSections.find(
          (s) => s.id === newSec.id || s.title.toLowerCase() === newSec.title.toLowerCase()
        );
        if (found) {
          const existingUrls = new Set(found.items.map((it: any) => it.url));
          for (const it of newSec.items) {
            if (!existingUrls.has(it.url)) {
              found.items.push(it);
              existingUrls.add(it.url);
            }
          }
        } else {
          mergedSections.push({
            ...newSec,
            displayOrder: mergedSections.length + 1,
          });
        }
      }

      // Merge gallery deduplicating by URL
      const existingGalUrls = new Set((existing.gallery || []).map((g) => g.url));
      const mergedGallery = [...(existing.gallery || [])];
      for (const g of allGalleryAssets) {
        if (!existingGalUrls.has(g.url)) {
          mergedGallery.push(g);
          existingGalUrls.add(g.url);
        }
      }

      // Merge videos deduplicating by URL
      const existingVidUrls = new Set((existing.videos || []).map((v) => v.url));
      const mergedVideos = [...(existing.videos || [])];
      for (const v of allVideoAssets) {
        if (!existingVidUrls.has(v.url)) {
          mergedVideos.push(v);
          existingVidUrls.add(v.url);
        }
      }

      const totalAssets = mergedGallery.length + mergedVideos.length;

      finalProject = await db.projects.update(existing.id, {
        sections: mergedSections,
        gallery: mergedGallery,
        videos: mergedVideos,
        coverImage: (!existing.coverImage || existing.coverImage.includes('unsplash')) ? coverImageUrl : existing.coverImage,
        shortDescription: `${existing.title} — Directorial campaign comprising ${mergedSections.length} sections and ${totalAssets} deliverable assets.`,
        updatedAt: new Date().toISOString(),
      });
    } else {
      finalProject = await db.projects.create({
        title: inferredTitle,
        slug,
        shortDescription: `${inferredTitle} — Directorial campaign comprising ${projectSections.length} sections and ${allGalleryAssets.length + allVideoAssets.length} deliverable assets.`,
        fullDescription: `${inferredTitle} — Comprehensive visual identity and campaign architecture featuring structured lookbooks, social narratives, web banners, and motion deliverables.`,
        categoryId: customCategory,
        subcategory: 'Complete Project Architecture',
        tags: [inferredTitle, 'Directorial Cut', 'Campaign Suite', customYear],
        coverImage: coverImageUrl,
        coverMediaId: allGalleryAssets[0]?.id || null,
        gallery: allGalleryAssets,
        videos: allVideoAssets,
        sections: projectSections,
        client: customClient || inferredTitle,
        year: customYear,
        services: [
          'Creative Direction',
          'Campaign Architecture',
          'Web Banners & Social Systems',
          'Visual Identity',
        ],
        role: customRole,
        credits: [{ role: 'Art Direction & Execution', name: 'Moiz Khan' }],
        featured: true,
        displayOrder: 1,
        status: 'published',
        seoTitle: `${inferredTitle} — Creative Campaign & Visual System`,
        seoDescription: `Directorial case study for ${inferredTitle} by Moiz Khan.`,
      });
    }

    const duplicateMessage =
      duplicatesPurged > 0
        ? ` Detected and purged ${duplicatesPurged} duplicate asset(s) automatically.`
        : '';

    return NextResponse.json({
      success: true,
      message: `Successfully ingested project folder "${inferredTitle}" with ${projectSections.length} section(s) and ${allGalleryAssets.length + allVideoAssets.length} asset(s).${duplicateMessage}`,
      project: finalProject,
      sectionCount: projectSections.length,
      fileCount: files.length,
      duplicatesPurged,
    });
  } catch (error: any) {
    console.error('[Upload Folder API] Error processing project folder:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error processing project folder upload.' },
      { status: 500 }
    );
  }
}
