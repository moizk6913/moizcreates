import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = await db.projects.getPublished();

    // Flatten all photos along with campaign metadata
    const flatItems: Array<{
      id: string;
      projectId: string;
      brand: string;
      tag: string;
      aspectClass: string;
      bgAccent: string;
      mediaType: 'image' | 'video';
      mediaUrl: string;
      posterUrl?: string;
    }> = [];

    const aspectPresets = [
      { tag: 'ART DIRECTION', aspectClass: 'aspect-[16/9]', bgAccent: 'bg-[#0f1115]' },
      { tag: 'BRANDING', aspectClass: 'aspect-[9/16]', bgAccent: 'bg-[#181329]' },
      { tag: 'CAMPAIGNS', aspectClass: 'aspect-[4/5]', bgAccent: 'bg-[#0b2416]' },
      { tag: 'DIGITAL', aspectClass: 'aspect-square', bgAccent: 'bg-[#141414]' },
      { tag: 'ART DIRECTION', aspectClass: 'aspect-[16/10]', bgAccent: 'bg-[#111317]' },
      { tag: 'CAMPAIGNS', aspectClass: 'aspect-[9/16]', bgAccent: 'bg-[#ff4e00]' },
      { tag: 'BRANDING', aspectClass: 'aspect-[4/5]', bgAccent: 'bg-[#966b2d]' },
    ];

    let presetIdx = 0;

    const allMedia = await db.media.getAll();
    const seenWorkUrls = new Set<string>();

    projects.forEach((proj) => {
      // If project has video, add video card first
      if (proj.videos && proj.videos.length > 0) {
        proj.videos.forEach((v, vIdx) => {
          if (!v.url || seenWorkUrls.has(v.url)) return;
          seenWorkUrls.add(v.url);
          const is916 = v.dimensions?.aspectRatio === '9:16';
          flatItems.push({
            id: v.id || `work-video-${proj.id}-${vIdx}`,
            projectId: proj.slug || proj.id,
            brand: proj.client?.toUpperCase() || proj.title.toUpperCase(),
            tag: proj.subcategory?.toUpperCase() || 'CAMPAIGN MOTION',
            aspectClass: is916 ? 'aspect-[9/16]' : 'aspect-[16/9]',
            bgAccent: 'bg-black',
            mediaType: 'video',
            mediaUrl: v.url,
            posterUrl: v.posterUrl || proj.coverImage,
          });
        });
      }

      // Add section items if project has structured sections
      if (Array.isArray(proj.sections) && proj.sections.length > 0) {
        proj.sections.forEach((sec) => {
          (sec.items || []).forEach((asset, sIdx) => {
            const url = asset.optimizedUrl || asset.url;
            if (!url || seenWorkUrls.has(url)) return;
            seenWorkUrls.add(url);

            const cfg = aspectPresets[presetIdx % aspectPresets.length];
            presetIdx++;

            let aspectClass = cfg.aspectClass;
            const ar = asset.dimensions?.aspectRatio;
            if (ar === '9:16') aspectClass = 'aspect-[9/16]';
            else if (ar === '4:5') aspectClass = 'aspect-[4/5]';
            else if (ar === '16:9') aspectClass = 'aspect-[16/9]';
            else if (ar === '1:1') aspectClass = 'aspect-square';

            flatItems.push({
              id: asset.id || `work-sec-${proj.id}-${sec.id}-${sIdx}`,
              projectId: proj.slug || proj.id,
              brand: proj.client?.toUpperCase() || proj.title.toUpperCase(),
              tag: sec.title.toUpperCase() || cfg.tag,
              aspectClass,
              bgAccent: cfg.bgAccent,
              mediaType: asset.type === 'video' ? 'video' : 'image',
              mediaUrl: url,
              posterUrl: asset.thumbnailUrl || url,
            });
          });
        });
      }

      // Add gallery stills
      if (Array.isArray(proj.gallery)) {
        proj.gallery.forEach((asset, idx) => {
          const url = asset.optimizedUrl || asset.url;
          if (!url || seenWorkUrls.has(url)) return;
          seenWorkUrls.add(url);

          const cfg = aspectPresets[presetIdx % aspectPresets.length];
          presetIdx++;

          let aspectClass = cfg.aspectClass;
          if (asset.dimensions?.aspectRatio === '9:16') aspectClass = 'aspect-[9/16]';
          else if (asset.dimensions?.aspectRatio === '4:5') aspectClass = 'aspect-[4/5]';
          else if (asset.dimensions?.aspectRatio === '16:9') aspectClass = 'aspect-[16/9]';
          else if (asset.dimensions?.aspectRatio === '1:1') aspectClass = 'aspect-square';

          flatItems.push({
            id: asset.id || `work-item-${proj.id}-${idx}`,
            projectId: proj.slug || proj.id,
            brand: proj.client?.toUpperCase() || proj.title.toUpperCase(),
            tag: cfg.tag,
            aspectClass,
            bgAccent: cfg.bgAccent,
            mediaType: asset.type === 'video' ? 'video' : 'image',
            mediaUrl: url,
            posterUrl: asset.thumbnailUrl || url,
          });
        });
      }
    });

    // Also include standalone media items (e.g. Playground experiments)
    allMedia.forEach((m, mIdx) => {
      const url = m.optimizedUrl || m.url;
      if (!url || seenWorkUrls.has(url)) return;
      seenWorkUrls.add(url);

      const isVideo = m.type === 'video' || url.endsWith('.mp4');
      const cfg = aspectPresets[presetIdx % aspectPresets.length];
      presetIdx++;

      let aspectClass = isVideo ? 'aspect-[9/16]' : cfg.aspectClass;
      if (m.dimensions?.aspectRatio === '9:16') aspectClass = 'aspect-[9/16]';
      else if (m.dimensions?.aspectRatio === '4:5') aspectClass = 'aspect-[4/5]';
      else if (m.dimensions?.aspectRatio === '16:9') aspectClass = 'aspect-[16/9]';
      else if (m.dimensions?.aspectRatio === '1:1') aspectClass = 'aspect-square';

      flatItems.push({
        id: m.id || `work-standalone-${mIdx}`,
        projectId: m.projectId || 'standalone',
        brand: 'DIRECTORIAL LAB',
        tag: 'EXPERIMENT',
        aspectClass,
        bgAccent: cfg.bgAccent,
        mediaType: isVideo ? 'video' : 'image',
        mediaUrl: url,
        posterUrl: m.thumbnailUrl || url,
      });
    });

    const targetPerLane = Math.max(5, Math.ceil(flatItems.length / 2));
    const rowOne = flatItems.slice(0, targetPerLane);
    const rowTwo = flatItems.slice(targetPerLane);

    return NextResponse.json({
      success: true,
      totalWorks: flatItems.length,
      rowOne,
      rowTwo,
      projects,
      media: allMedia,
    });
  } catch (error: any) {
    console.error('[Public Works API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch works.' },
      { status: 500 }
    );
  }
}
