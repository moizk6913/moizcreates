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
      return NextResponse.json({ success: false, error: 'Article slug is required.' }, { status: 400 });
    }

    const post = await db.blog.getBySlug(slug);
    if (!post || post.status === 'draft') {
      return NextResponse.json({ success: false, error: 'Article not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error('[Public Blog Slug GET] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve article.' }, { status: 500 });
  }
}
