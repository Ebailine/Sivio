import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    const validPassword = process.env.SITE_PASSWORD || 'sivio2025';

    if (password === validPassword) {
      // Set a cookie that lasts 30 days
      const cookieStore = await cookies();
      cookieStore.set('site-auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  // Logout endpoint
  const cookieStore = await cookies();
  cookieStore.delete('site-auth');
  return NextResponse.json({ success: true });
}
