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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    const { storyId } = await params;
    const body = await request.json();
    const { title, description, coverUrl, language, genre } = body;

    const existing = await db.roleplayStory.findUnique({ where: { id: storyId } });
    if (!existing) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    const story = await db.roleplayStory.update({
      where: { id: storyId },
      data: {
        ...(title !== undefined && { title: String(title).trim() }),
        ...(description !== undefined && { description: String(description).trim() }),
        ...(coverUrl !== undefined && { coverUrl: String(coverUrl).trim() }),
        ...(language !== undefined && { language: String(language) }),
        ...(genre !== undefined && { genre: String(genre) }),
      },
      include: { scenes: { orderBy: { createdAt: 'asc' } } },
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error('Error updating roleplay story:', error);
    return NextResponse.json({ error: 'Failed to update roleplay story' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    const { storyId } = await params;

    const existing = await db.roleplayStory.findUnique({ where: { id: storyId } });
    if (!existing) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    await db.roleplayStory.delete({ where: { id: storyId } });
    return NextResponse.json({ message: 'Roleplay story deleted successfully' });
  } catch (error) {
    console.error('Error deleting roleplay story:', error);
    return NextResponse.json({ error: 'Failed to delete roleplay story' }, { status: 500 });
  }
}