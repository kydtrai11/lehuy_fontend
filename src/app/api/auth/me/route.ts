import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('session')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    return NextResponse.json({
      user: {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch (error) {
    console.error('Auth check failed:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
