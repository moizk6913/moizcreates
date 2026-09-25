import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await db.categories.getAll(false);
    const publishedProjects = await db.projects.getPublished();

    const enriched = categories.map((cat) => {
      const catProjects = publishedProjects.filter((p) => p.categoryId === cat.id);
      return {
        ...cat,
        projectsCount: catProjects.length,
      };
    });

    return NextResponse.json({
      success: true,
      categories: enriched,
    });
  } catch (error: any) {
    console.error('[Public Categories API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories.' },
      { status: 500 }
    );
  }
}
