import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { rateLimit, validateJsonRequest } from '@/lib/api-security';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const novel = await db.novel.findUnique({
    where: { id },
    include: { chapters: { orderBy: { number: 'asc' } } },
  });

  if (!novel) {
    return NextResponse.json({ error: 'Novel not found' }, { status: 404 });
  }

  return NextResponse.json(novel);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateResult = rateLimit(request, { windowMs: 60000, maxRequests: 30 });
  if (rateResult) return rateResult;

  const validationError = await validateJsonRequest(request);
  if (validationError) return validationError;

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, author, description, coverUrl, language, category, rating, status } = body;

    const existing = await db.novel.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Novel not found' }, { status: 404 });
    }

    const novel = await db.novel.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: String(title).trim() }),
        ...(author !== undefined && { author: String(author).trim() }),
        ...(description !== undefined && { description: String(description).trim() }),
        ...(coverUrl !== undefined && { coverUrl: String(coverUrl).trim() }),
        ...(language !== undefined && { language: String(language) }),
        ...(category !== undefined && { category: String(category) }),
        ...(rating !== undefined && { rating: Math.min(5, Math.max(0, Number(rating))) }),
        ...(status !== undefined && { status: String(status) }),
      },
      include: { chapters: { select: { id: true, number: true, title: true }, orderBy: { number: 'asc' } } },
    });

    return NextResponse.json(novel);
  } catch (error) {
    console.error('Error updating novel:', error);
    return NextResponse.json({ error: 'Failed to update novel' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateResult = rateLimit(request, { windowMs: 60000, maxRequests: 30 });
  if (rateResult) return rateResult;

  try {
    const { id } = await params;

    const existing = await db.novel.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Novel not found' }, { status: 404 });
    }

    await db.novel.delete({ where: { id } });
    return NextResponse.json({ message: 'Novel deleted successfully' });
  } catch (error) {
    console.error('Error deleting novel:', error);
    return NextResponse.json({ error: 'Failed to delete novel' }, { status: 500 });
  }
}