import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_jwt_secret_key_change_this_in_production_12345';

// Define protected routes that require authentication
// Make onboarding public to avoid redirect loops; page logic will guard and APIs still require auth
const PROTECTED_ROUTES = ['/dashboard', '/profile'];
const PUBLIC_ROUTES = ['/', '/landing', '/login', '/signup', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  // Allow all public routes to pass through
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Get token from cookies or headers
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      jwt.verify(token, JWT_SECRET);
      return NextResponse.next();
    } catch (_error) {
      // Token invalid or missing; redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Default: allow access
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