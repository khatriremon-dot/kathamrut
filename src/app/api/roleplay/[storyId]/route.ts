import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  const { storyId } = await params;
  const story = await db.roleplayStory.findUnique({
    where: { id: storyId },
    include: { scenes: { orderBy: { createdAt: 'asc' } } },
  });

  if (!story) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 });
  }

  return NextResponse.json(story);
}
