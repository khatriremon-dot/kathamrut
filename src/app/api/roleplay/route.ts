import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { rateLimit, validateJsonRequest } from '@/lib/api-security';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('language') || 'all';
  const genre = searchParams.get('genre') || 'all';

  const where: Record<string, unknown> = {};
  if (language !== 'all') where.language = language;
  if (genre !== 'all') where.genre = genre;

  const stories = await db.roleplayStory.findMany({
    where,
    include: { scenes: { orderBy: { createdAt: 'asc' } } },
  });

  return NextResponse.json(stories);
}

export async function POST(request: Request) {
  const rateResult = rateLimit(request, { windowMs: 60000, maxRequests: 30 });
  if (rateResult) return rateResult;

  const validationError = await validateJsonRequest(request);
  if (validationError) return validationError;

  try {
    const body = await request.json();
    const { title, description, coverUrl, language, genre } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const story = await db.roleplayStory.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        coverUrl: typeof coverUrl === 'string' ? coverUrl.trim() : '',
        language: typeof language === 'string' ? language : 'en',
        genre: typeof genre === 'string' ? genre : 'adventure',
      },
      include: { scenes: { orderBy: { createdAt: 'asc' } } },
    });

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error('Error creating roleplay story:', error);
    return NextResponse.json({ error: 'Failed to create roleplay story' }, { status: 500 });
  }
}