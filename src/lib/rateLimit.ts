import { NextRequest, NextResponse } from 'next/server';

const RATE_LIMIT_STORE = new Map<string, { count: number; resetAt: number }>();

const getClientIp = (request: NextRequest): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return 'unknown';
};

export const rateLimit = (
  request: NextRequest,
  options: { windowMs: number; max: number; keyPrefix?: string }
): NextResponse | null => {
  const ip = getClientIp(request);
  const key = `${options.keyPrefix || 'rl'}:${ip}`;
  const now = Date.now();

  const existing = RATE_LIMIT_STORE.get(key);
  if (!existing || existing.resetAt <= now) {
    RATE_LIMIT_STORE.set(key, { count: 1, resetAt: now + options.windowMs });
    return null;
  }

  if (existing.count >= options.max) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  existing.count += 1;
  RATE_LIMIT_STORE.set(key, existing);
  return null;
};
