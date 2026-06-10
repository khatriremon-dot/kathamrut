import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect mutating API routes with a simple Bearer token
  // Read operations are public
  if (pathname.startsWith('/api/')) {
    const method = request.method.toUpperCase();
    const isMutation = method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH';

    if (isMutation && !pathname.startsWith('/api/og') && !pathname.startsWith('/api/auth/verify')) {
      const authHeader = request.headers.get('authorization');
      const adminPassword = process.env.ADMIN_PASSWORD || 'kathamrut2025';

      // Accept either Bearer token or x-admin-key header
      const token = authHeader?.replace('Bearer ', '') || request.headers.get('x-admin-key');

      if (!token || token !== adminPassword) {
        return NextResponse.json(
          { error: 'Unauthorized. Provide valid admin credentials.' },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};