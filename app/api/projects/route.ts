import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const featured = searchParams.get('featured') === 'true' ? true : undefined;

    // Strict security rule: Only published projects returned on public API
    let projects = await db.projects.getPublished(category);

    if (featured !== undefined) {
      projects = projects.filter((p) => p.featured === featured);
    }

    return NextResponse.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error: any) {
    console.error('[Public Projects API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio projects.' },
      { status: 500 }
    );
  }
}
