import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // السماح بالوصول إلى صفحات المصادقة دون تحقق
  if (
    pathname.startsWith('/auth/') ||
    pathname === '/terms' ||
    pathname === '/privacy'
  ) {
    return NextResponse.next()
  }

  // التحقق من وجود جلسة للمستخدم
  const userToken = request.cookies.get('sb-access-token')
  const adminToken = request.cookies.get('admin_token')

  // إذا كان يحاول الوصول إلى /admin بدون token
  if (pathname.startsWith('/admin') && !adminToken) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // إذا كان يحاول الوصول إلى /dashboard بدون token
  if (pathname.startsWith('/dashboard') && !userToken) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
