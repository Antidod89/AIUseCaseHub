import { NextRequest, NextResponse } from 'next/server';

// Middleware для защиты /admin и редиректов аутентификации
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    const accessToken = req.cookies.get('accessToken')?.value;
    if (!accessToken) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname === '/login' || pathname === '/register') {
    const accessToken = req.cookies.get('accessToken')?.value;
    if (accessToken) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/register']
};

