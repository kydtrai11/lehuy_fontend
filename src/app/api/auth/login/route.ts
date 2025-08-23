import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import axios from 'axios';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Gọi API backend thật để kiểm tra tài khoản & lấy role
  const BE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  try {
    const { data: user } = await axios.post(`${BE_URL}/auth/login`, { email, password });
    
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const token = await new SignJWT({ role: user.role, sub: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    const res = NextResponse.json({ ok: true });
    res.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (error) {
    return NextResponse.json({ ok: false, message: 'Đăng nhập thất bại' }, { status: 401 });
  }
}