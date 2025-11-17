import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only apply password protection in production
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next()
  }

  // Skip password protection for API routes, webhooks, and static files
  const pathname = request.nextUrl.pathname
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  // Check for authentication
  const authHeader = request.headers.get('authorization')

  if (!authHeader) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="SIVIO Access"',
      },
    })
  }

  // Parse Basic auth header
  const auth = authHeader.split(' ')[1]
  const [user, password] = Buffer.from(auth, 'base64').toString().split(':')

  // Check credentials (username: admin, password from env variable)
  const validPassword = process.env.SITE_PASSWORD || 'sivio2025'

  if (user !== 'admin' || password !== validPassword) {
    return new NextResponse('Invalid credentials', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="SIVIO Access"',
      },
    })
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
