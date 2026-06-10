import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const scene = await db.roleplayScene.findUnique({
    where: { id },
  });

  if (!scene) {
    return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
  }

  return NextResponse.json(scene);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, narrative, imageUrl, choices, isStart } = body;

    const existing = await db.roleplayScene.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = String(title).trim();
    if (narrative !== undefined) updateData.narrative = String(narrative).trim();
    if (imageUrl !== undefined) updateData.imageUrl = String(imageUrl).trim();
    if (isStart !== undefined) updateData.isStart = Boolean(isStart);
    if (choices !== undefined) {
      updateData.choices = typeof choices === 'string' ? choices : JSON.stringify(choices);
    }

    const scene = await db.roleplayScene.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(scene);
  } catch (error) {
    console.error('Error updating scene:', error);
    return NextResponse.json({ error: 'Failed to update scene' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.roleplayScene.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }

    await db.roleplayScene.delete({ where: { id } });
    return NextResponse.json({ message: 'Scene deleted successfully' });
  } catch (error) {
    console.error('Error deleting scene:', error);
    return NextResponse.json({ error: 'Failed to delete scene' }, { status: 500 });
  }
}