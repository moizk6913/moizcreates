import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const project = await db.projects.getById(id);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await db.projects.update(id, body);
    let finalProject: any = updated;
    if (!finalProject) {
      if (body.title) {
        // Upsert fallback if project was created with this client ID
        finalProject = await db.projects.create({
          id,
          title: body.title,
          slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          shortDescription: body.shortDescription || '',
          fullDescription: body.fullDescription || '',
          categoryId: body.categoryId || 'art-direction',
          subcategory: body.subcategory || '',
          tags: Array.isArray(body.tags) ? body.tags : [],
          coverImage: body.coverImage || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80',
          coverMediaId: body.coverMediaId || null,
          gallery: Array.isArray(body.gallery) ? body.gallery : [],
          videos: Array.isArray(body.videos) ? body.videos : [],
          sections: Array.isArray(body.sections) ? body.sections : [],
          client: body.client || '',
          year: body.year || new Date().getFullYear().toString(),
          services: Array.isArray(body.services) ? body.services : [],
          role: body.role || 'Lead Art Director',
          credits: Array.isArray(body.credits) ? body.credits : [],
          featured: Boolean(body.featured),
          displayOrder: typeof body.displayOrder === 'number' ? body.displayOrder : 999,
          status: body.status === 'published' ? 'published' : body.status === 'archived' ? 'archived' : 'draft',
        });
      } else {
        return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
      }
    }

    return NextResponse.json({ success: true, project: finalProject });
  } catch (error: any) {
    console.error('[Admin Project PUT] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const archiveOnly = searchParams.get('archive') === 'true';

    const success = await db.projects.delete(id, archiveOnly);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: archiveOnly ? 'Project archived successfully.' : 'Project permanently deleted.',
    });
  } catch (error: any) {
    console.error('[Admin Project DELETE] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
