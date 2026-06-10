import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD || 'kathamrut2025';
  const providedKey = request.headers.get('x-admin-key');

  if (providedKey === adminPassword) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}