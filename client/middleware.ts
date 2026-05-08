import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, AUTH_COOKIE_NAME } from './src/lib/auth';

// Add paths that require authentication
const protectedPaths = ['/setup', '/interview'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (isProtected && !token) {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

  if (token) {
    const payload = await verifyToken(token);
    if (!payload && isProtected) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
