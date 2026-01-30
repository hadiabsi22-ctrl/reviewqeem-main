import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // حماية جميع مسارات لوحة التحكم
  if (pathname.startsWith('/management-station')) {
    // السماح بصفحة تسجيل الدخول
    if (pathname === '/management-station/login') {
      return NextResponse.next();
    }

    // التحقق من وجود token في cookies أو headers
    const token = request.cookies.get('adminToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      // إعادة توجيه إلى صفحة تسجيل الدخول
      const loginUrl = new URL('/management-station/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // التحقق من صحة token (اختياري - يمكن إضافة API call هنا)
    // في الوقت الحالي، نعتمد على localStorage في العميل
    // يمكن إضافة تحقق من السيرفر هنا لاحقاً
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/management-station/:path*',
  ],
};
