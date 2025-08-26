import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const verifyJWT = async (token: string) => {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload as { role?: string };
  } catch {
    return null;
  }
};

export async function middleware(req: NextRequest) {
  console.log('🔥 Middleware is running:', req.nextUrl.pathname); // check chạy

  const { pathname } = req.nextUrl;

  if (!pathname.startsWith('/admin')) return NextResponse.next();

  const token = req.cookies.get('session')?.value;
  console.log('🍪 Cookie token:', token);

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  const payload = await verifyJWT(token);
  console.log('🔓 Payload:', payload);

  // if (!payload || payload.role !== 'admin') {
  //   const url = req.nextUrl.clone();
  //   url.pathname = '/login';
  //   return NextResponse.redirect(url);
  // }
  // lưu ý 

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
