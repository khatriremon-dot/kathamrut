import { NextResponse } from 'next/server';

// ─── JSON Request Validation ─────────────────────────────────────────────────
export async function validateJsonRequest(request: Request): Promise<NextResponse | null> {
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
  }
  return null;
}

// ─── CORS Headers Helper ─────────────────────────────────────────────────────
export function corsHeaders(response: NextResponse, origin?: string) {
  response.headers.set('Access-Control-Allow-Origin', origin || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// ─── Simple In-Memory Rate Limiter ───────────────────────────────────────────
interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

const rateLimitMap = new Map<string, number[]>();

// Clean up old entries periodically (every 5 minutes)
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of rateLimitMap.entries()) {
      const filtered = timestamps.filter((t) => now - t < 300000);
      if (filtered.length === 0) {
        rateLimitMap.delete(key);
      } else {
        rateLimitMap.set(key, filtered);
      }
    }
  }, 300000).unref();
}

export function rateLimit(
  request: Request,
  options: RateLimitOptions = { windowMs: 60000, maxRequests: 30 }
): NextResponse | null {
  // Extract IP from headers
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

  const now = Date.now();
  const windowStart = now - options.windowMs;

  const timestamps = rateLimitMap.get(ip) || [];
  const recentRequests = timestamps.filter((t) => t > windowStart);

  if (recentRequests.length >= options.maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(options.windowMs / 1000)),
        },
      }
    );
  }

  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return null;
}