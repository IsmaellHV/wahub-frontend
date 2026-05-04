import { NextResponse, type NextRequest } from 'next/server';

const COOKIE = 'wahub:locale';
const SUPPORTED = ['en', 'es'] as const;
type Locale = (typeof SUPPORTED)[number];

// Pick `es` if the visitor's primary Accept-Language starts with `es`,
// otherwise default to `en`. Quality factors are ignored — first preference
// is enough for a 2-locale site.
const detectFromHeader = (header: string | null): Locale => {
  if (!header) return 'en';
  const first = header.split(',')[0]?.trim().toLowerCase() ?? '';
  return first.startsWith('es') ? 'es' : 'en';
};

// Sets a long-lived locale cookie on first visit (resolved from the
// browser's Accept-Language) so SSR gets a deterministic value on every
// subsequent render — kills the EN ↔ ES content flash on hydration.
export function middleware(req: NextRequest) {
  const existing = req.cookies.get(COOKIE)?.value as Locale | undefined;
  const valid = existing && (SUPPORTED as readonly string[]).includes(existing) ? existing : null;

  const res = NextResponse.next();
  if (!valid) {
    const detected = detectFromHeader(req.headers.get('accept-language'));
    res.cookies.set(COOKIE, detected, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });
  }
  return res;
}

export const config = {
  matcher: ['/((?!_next/|favicon|icon\\.svg|robots\\.txt|sitemap).*)'],
};
