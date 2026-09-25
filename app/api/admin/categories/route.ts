import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const categories = await db.categories.getAll(true);
    return NextResponse.json({ success: true, count: categories.length, categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, slug, description } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ success: false, error: 'Category name is required.' }, { status: 400 });
    }

    const cleanSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cleanId = body.id || cleanSlug;

    // Check if ID or slug already exists
    const existing = await db.categories.getById(cleanId);
    if (existing) {
      return NextResponse.json({ success: false, error: 'Category with this ID/slug already exists.' }, { status: 400 });
    }

    const created = await db.categories.create({
      id: cleanId,
      name: name.trim(),
      slug: cleanSlug,
      description: description || '',
      coverImage: body.coverImage,
      displayOrder: typeof body.displayOrder === 'number' ? body.displayOrder : 99,
      visibility: body.visibility === 'hidden' ? 'hidden' : 'visible',
    });

    return NextResponse.json({ success: true, category: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID is required.' }, { status: 400 });
    }

    const updated = await db.categories.update(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Category not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, category: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!verifyAdminSession(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID is required.' }, { status: 400 });
    }

    const success = await db.categories.delete(id);
    return NextResponse.json({ success, message: success ? 'Category removed.' : 'Category not found.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
