import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/portal', '/auth', '/auth/callback', '/auth/reset-password'];
const AUTH_ROUTES = ['/auth'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Safeguard: if env vars are missing, allow public routes, block dashboard
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('[Middleware] Missing Supabase env vars');
    const pathname = request.nextUrl.pathname;
    const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));
    const isApiRoute = pathname.startsWith('/api/');
    if (!isPublic && !isApiRoute) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    return response;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.warn('[Middleware] Auth error:', authError.message);
    }

    const pathname = request.nextUrl.pathname;

    // Redirect authenticated users away from auth pages
    if (user && AUTH_ROUTES.some(r => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Protect dashboard routes
    const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));
    const isApiRoute = pathname.startsWith('/api/');

    if (!user && !isPublic && !isApiRoute) {
      const redirectUrl = new URL('/auth', request.url);
      redirectUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  } catch (err) {
    console.error('[Middleware] Unhandled error:', err);
    // Fail open for public routes on middleware crash
    const pathname = request.nextUrl.pathname;
    const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));
    const isApiRoute = pathname.startsWith('/api/');
    if (!isPublic && !isApiRoute) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
