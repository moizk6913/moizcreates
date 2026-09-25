import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ categorySlug: string }> }
) {
  try {
    const { categorySlug } = await context.params;
    if (!categorySlug) {
      return NextResponse.json(
        { success: false, error: 'Category slug is required.' },
        { status: 400 }
      );
    }

    const category = await db.categories.getBySlug(categorySlug);
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Archive category not found.' },
        { status: 404 }
      );
    }

    const projects = await db.projects.getPublished(category.id);

    // Collect all deliverables from projects in this category
    const deliverables: Array<{
      url: string;
      title: string;
      type: 'stills' | 'banners' | 'social';
      aspect: 'portrait' | 'landscape' | 'vertical';
      projectName?: string;
    }> = [];

    projects.forEach((proj) => {
      proj.gallery.forEach((asset, idx) => {
        const isPortrait = asset.dimensions.orientation === 'vertical' || asset.dimensions.aspectRatio === '4:5';
        const isPanoramic = asset.dimensions.orientation === 'panoramic' || asset.dimensions.aspectRatio === '21:9' || asset.dimensions.aspectRatio === '16:9';
        const isVertical = asset.dimensions.aspectRatio === '9:16';

        let type: 'stills' | 'banners' | 'social' = 'stills';
        let aspect: 'portrait' | 'landscape' | 'vertical' = 'portrait';

        if (isVertical) {
          type = 'social';
          aspect = 'vertical';
        } else if (isPanoramic) {
          type = 'banners';
          aspect = 'landscape';
        } else {
          type = 'stills';
          aspect = 'portrait';
        }

        deliverables.push({
          url: asset.optimizedUrl || asset.url,
          title: `${proj.title} // Frame #${String(idx + 1).padStart(2, '0')}`,
          type,
          aspect,
          projectName: proj.title,
        });
      });
    });

    return NextResponse.json({
      success: true,
      category,
      projects,
      deliverables,
    });
  } catch (error: any) {
    console.error('[Archive Detail API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch archive category data.' },
      { status: 500 }
    );
  }
}
