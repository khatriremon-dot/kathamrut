import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { rateLimit, validateJsonRequest } from '@/lib/api-security';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('language') || 'all';
  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';

  const where: Record<string, unknown> = {};
  if (language !== 'all') where.language = language;
  if (category !== 'all') where.category = category;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { author: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const novels = await db.novel.findMany({
    where,
    include: { chapters: { select: { id: true, number: true, title: true }, orderBy: { number: 'asc' } } },
    orderBy: { views: 'desc' },
  });

  return NextResponse.json(novels);
}

export async function POST(request: Request) {
  const rateResult = rateLimit(request, { windowMs: 60000, maxRequests: 30 });
  if (rateResult) return rateResult;

  const validationError = await validateJsonRequest(request);
  if (validationError) return validationError;

  try {
    const body = await request.json();
    const { title, author, description, coverUrl, language, category, rating, status } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!author || typeof author !== 'string' || author.trim().length === 0) {
      return NextResponse.json({ error: 'Author is required' }, { status: 400 });
    }
    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const novel = await db.novel.create({
      data: {
        title: title.trim(),
        author: author.trim(),
        description: description.trim(),
        coverUrl: typeof coverUrl === 'string' ? coverUrl.trim() : '',
        language: typeof language === 'string' ? language : 'en',
        category: typeof category === 'string' ? category : 'fiction',
        rating: typeof rating === 'number' ? Math.min(5, Math.max(0, rating)) : 4.5,
        status: typeof status === 'string' ? status : 'ongoing',
      },
      include: { chapters: { select: { id: true, number: true, title: true }, orderBy: { number: 'asc' } } },
    });

    return NextResponse.json(novel, { status: 201 });
  } catch (error) {
    console.error('Error creating novel:', error);
    return NextResponse.json({ error: 'Failed to create novel' }, { status: 500 });
  }
}