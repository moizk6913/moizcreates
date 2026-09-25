import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { ProjectStatus } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ProjectStatus | undefined;
    const categoryId = searchParams.get('categoryId') || undefined;

    const projects = await db.projects.getAll({ status, categoryId });
    return NextResponse.json({ success: true, count: projects.length, projects });
  } catch (error: any) {
    console.error('[Admin Projects GET] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, categoryId } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Project title is required.' }, { status: 400 });
    }

    const targetCategory = (categoryId && typeof categoryId === 'string' && categoryId.trim()) ? categoryId.trim() : 'art-direction';

    const created = await db.projects.create({
      title: title.trim(),
      slug: body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      shortDescription: body.shortDescription || '',
      fullDescription: body.fullDescription || '',
      categoryId: targetCategory,
      subcategory: body.subcategory || '',
      tags: Array.isArray(body.tags) ? body.tags : [],
      coverImage: body.coverImage || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80',
      coverMediaId: body.coverMediaId || null,
      gallery: Array.isArray(body.gallery) ? body.gallery : [],
      videos: Array.isArray(body.videos) ? body.videos : [],
      client: body.client || '',
      year: body.year || new Date().getFullYear().toString(),
      services: Array.isArray(body.services) ? body.services : [],
      role: body.role || 'Lead Art Director',
      credits: Array.isArray(body.credits) ? body.credits : [],
      featured: Boolean(body.featured),
      displayOrder: typeof body.displayOrder === 'number' ? body.displayOrder : 999,
      status: body.status === 'published' ? 'published' : body.status === 'archived' ? 'archived' : 'draft',
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      socialImage: body.socialImage,
    });

    return NextResponse.json({ success: true, project: created });
  } catch (error: any) {
    console.error('[Admin Projects POST] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
