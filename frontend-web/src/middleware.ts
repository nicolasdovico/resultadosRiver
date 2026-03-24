import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const isAuthRoute = pathname.startsWith('/auth');
  const isLanding = pathname === '/';
  const isPublicResource = pathname.startsWith('/_next') || 
                           pathname.includes('/favicon.ico') ||
                           pathname.startsWith('/api/');

  if (isPublicResource || isLanding || isAuthRoute) {
    // If user is already logged in and tries to access login/register, send to home
    if (token && isAuthRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // If there's no token and user tries to access any other route (protected), redirect to login
  if (!token) {
    const url = new URL('/auth/login', request.url);
    // You could optionally allow guest access to some data routes here
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
