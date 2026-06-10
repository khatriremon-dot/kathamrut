import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    const { storyId } = await params;

    const story = await db.roleplayStory.findUnique({ where: { id: storyId } });
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    const scenes = await db.roleplayScene.findMany({
      where: { storyId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(scenes);
  } catch (error) {
    console.error('Error fetching scenes:', error);
    return NextResponse.json({ error: 'Failed to fetch scenes' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ storyId: string }> }
) {
  try {
    const { storyId } = await params;
    const body = await request.json();
    const { title, narrative, imageUrl, choices, isStart } = body;

    const story = await db.roleplayStory.findUnique({ where: { id: storyId } });
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!narrative || typeof narrative !== 'string') {
      return NextResponse.json({ error: 'Narrative is required' }, { status: 400 });
    }

    let choicesStr = '[]';
    if (choices !== undefined) {
      if (typeof choices === 'string') {
        choicesStr = choices;
      } else {
        choicesStr = JSON.stringify(choices);
      }
    }

    const scene = await db.roleplayScene.create({
      data: {
        storyId,
        title: title.trim(),
        narrative: narrative.trim(),
        imageUrl: typeof imageUrl === 'string' ? imageUrl.trim() : '',
        choices: choicesStr,
        isStart: typeof isStart === 'boolean' ? isStart : false,
      },
    });

    return NextResponse.json(scene, { status: 201 });
  } catch (error) {
    console.error('Error creating scene:', error);
    return NextResponse.json({ error: 'Failed to create scene' }, { status: 500 });
  }
}