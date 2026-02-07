import { NextRequest, NextResponse } from 'next/server';

const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

const getAllowedOrigin = (request: NextRequest): string => {
  const origin = request.headers.get('origin') || '';
  const allowList = (process.env.MC_ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  if (allowList.length === 0) return origin || '*';
  return allowList.includes(origin) ? origin : allowList[0];
};

const isBasicAuthValid = (request: NextRequest): boolean => {
  const user = process.env.MC_BASIC_AUTH_USER;
  const pass = process.env.MC_BASIC_AUTH_PASS;
  if (!user || !pass) return true;

  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Basic ')) return false;

  const decoded = atob(auth.slice(6));
  const [u, p] = decoded.split(':');
  return u === user && p === pass;
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api')) {
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 });
      response.headers.set('Access-Control-Allow-Origin', getAllowedOrigin(request));
      response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      return response;
    }
  }

  if (!isBasicAuthValid(request)) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Mission Control"',
      },
    });
  }

  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  if (pathname.startsWith('/api')) {
    response.headers.set('Access-Control-Allow-Origin', getAllowedOrigin(request));
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
