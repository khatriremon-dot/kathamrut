import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { rateLimit, validateJsonRequest } from '@/lib/api-security';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const chapter = await db.chapter.findUnique({
    where: { id },
  });

  if (!chapter) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
  }

  return NextResponse.json(chapter);
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
    const { title, content, number } = body;

    const existing = await db.chapter.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    const chapter = await db.chapter.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: String(title).trim() }),
        ...(content !== undefined && { content: String(content) }),
        ...(number !== undefined && { number: Number(number) }),
      },
    });

    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Error updating chapter:', error);
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
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

    const existing = await db.chapter.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    await db.chapter.delete({ where: { id } });
    return NextResponse.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 });
  }
}