import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only apply password protection in production
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next()
  }

  const pathname = request.nextUrl.pathname

  // Skip password protection for API routes, webhooks, static files, and login page
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/site-login') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  // Check for authentication cookie
  const authCookie = request.cookies.get('site-auth')

  if (!authCookie || authCookie.value !== 'authenticated') {
    // Redirect to login page
    const loginUrl = new URL('/site-login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authentication successful
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
