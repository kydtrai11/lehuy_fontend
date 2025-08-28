import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  // URL backend
  const BE_URL = "http://localhost:5001";
  // const BE_URL = "https://dambody.vn"
  // const BE_URL = process.env.NEXT_PUBLIC_API_URL

  try {
    const response = await fetch(`${BE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Backend login failed");
    }

    const user = await response.json();

    // Tạo JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    console.log(process.env.JWT_SECRET);
    const token = await new SignJWT({ role: user.role, sub: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    // Trả response kèm cookie
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
    console.error(error);
    return NextResponse.json(
      { ok: false, message: 'Đăng nhập thất bại', error: (error as any).message },
      { status: 401 }
    );
  }
}
