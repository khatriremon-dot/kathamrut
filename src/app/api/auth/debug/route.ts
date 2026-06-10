import { NextResponse } from 'next/server';

// Temporary debug endpoint — REMOVE after fixing login
export async function GET() {
  const password = process.env.ADMIN_PASSWORD || '(NOT SET - using fallback)';
  const hasPassword = !!process.env.ADMIN_PASSWORD;
  const dbUrl = process.env.DATABASE_URL ? 'SET' : '(NOT SET)';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '(NOT SET)';

  return NextResponse.json({
    ADMIN_PASSWORD_IS_SET: hasPassword,
    ADMIN_PASSWORD_LENGTH: hasPassword ? (process.env.ADMIN_PASSWORD as string).length : 0,
    DATABASE_URL_IS_SET: dbUrl === 'SET',
    NEXT_PUBLIC_SITE_URL: siteUrl,
    hint: hasPassword ? 'Password is configured' : 'ADMIN_PASSWORD env var is NOT set in Vercel!',
  });
}