// src/middleware.js

import { NextResponse } from 'next/server';

export function middleware(req) {
  const accessToken = req.cookies.get('accessToken');

  if (!accessToken && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard'],
};
