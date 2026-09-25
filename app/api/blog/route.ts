import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const posts = await db.blog.getAll(false); // strictly published
    return NextResponse.json({ success: true, count: posts.length, posts });
  } catch (error: any) {
    console.error('[Public Blog GET] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve blog posts.' }, { status: 500 });
  }
}
