import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const posts = await db.blog.getAll(true); // include drafts
    return NextResponse.json({ success: true, count: posts.length, posts });
  } catch (error: any) {
    console.error('[Admin Blog GET] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, subtitle, content, category } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Article title is required.' }, { status: 400 });
    }

    const slug = body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const created = await db.blog.create({
      title: title.trim(),
      slug,
      subtitle: subtitle ? subtitle.trim() : '',
      excerpt: body.excerpt ? body.excerpt.trim() : (Array.isArray(content) && content[0] ? content[0].slice(0, 160) + '...' : ''),
      content: Array.isArray(content) ? content : (content ? [content] : []),
      category: category ? category.trim().toUpperCase() : 'TECHNIQUE & PHILOSOPHY',
      readTime: body.readTime || `${Math.max(2, Math.round((Array.isArray(content) ? content.join(' ').split(' ').length : 100) / 200))} MIN READ`,
      specs: body.specs || undefined,
      status: body.status || 'published',
    });

    return NextResponse.json({ success: true, post: created });
  } catch (error: any) {
    console.error('[Admin Blog POST] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
