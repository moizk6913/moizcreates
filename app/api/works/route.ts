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

    projects.forEach((proj) => {
      // If project has video, add video card first
      if (proj.videos && proj.videos.length > 0) {
        const v = proj.videos[0];
        const is916 = v.dimensions?.aspectRatio === '9:16';
        flatItems.push({
          id: `work-video-${proj.id}`,
          projectId: proj.slug || proj.id,
          brand: proj.client?.toUpperCase() || proj.title.toUpperCase(),
          tag: proj.subcategory?.toUpperCase() || 'CAMPAIGN MOTION',
          aspectClass: is916 ? 'aspect-[9/16]' : 'aspect-[16/9]',
          bgAccent: 'bg-black',
          mediaType: 'video',
          mediaUrl: v.url,
          posterUrl: v.posterUrl || proj.coverImage,
        });
      }

      // Add gallery stills
      proj.gallery.forEach((asset, idx) => {
        const cfg = aspectPresets[presetIdx % aspectPresets.length];
        presetIdx++;

        let aspectClass = cfg.aspectClass;
        if (asset.dimensions?.aspectRatio === '9:16') aspectClass = 'aspect-[9/16]';
        else if (asset.dimensions?.aspectRatio === '4:5') aspectClass = 'aspect-[4/5]';
        else if (asset.dimensions?.aspectRatio === '16:9') aspectClass = 'aspect-[16/9]';
        else if (asset.dimensions?.aspectRatio === '1:1') aspectClass = 'aspect-square';

        flatItems.push({
          id: `work-item-${proj.id}-${idx}`,
          projectId: proj.slug || proj.id,
          brand: proj.client?.toUpperCase() || proj.title.toUpperCase(),
          tag: cfg.tag,
          aspectClass,
          bgAccent: cfg.bgAccent,
          mediaType: 'image',
          mediaUrl: asset.optimizedUrl || asset.url,
          posterUrl: asset.thumbnailUrl || asset.url,
        });
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
    });
  } catch (error: any) {
    console.error('[Public Works API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch works.' },
      { status: 500 }
    );
  }
}
