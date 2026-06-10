import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

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
