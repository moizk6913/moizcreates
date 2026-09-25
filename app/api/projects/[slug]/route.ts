import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug parameter is required.' },
        { status: 400 }
      );
    }

    const project = await db.projects.getBySlug(slug);

    // Only return published projects on public endpoint
    if (!project || project.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'Project not found.' },
        { status: 404 }
      );
    }

    // Attach category information
    const category = await db.categories.getById(project.categoryId);

    return NextResponse.json({
      success: true,
      project: {
        ...project,
        categoryName: category?.name || project.categoryId,
      },
    });
  } catch (error: any) {
    console.error('[Public Project Detail API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project.' },
      { status: 500 }
    );
  }
}
