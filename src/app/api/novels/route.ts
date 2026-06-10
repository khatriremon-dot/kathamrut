import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

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
