// ==================== Serve Uploaded Files ====================
// هذا الـ route يخدم ملفات uploads بشكل صحيح

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // بناء المسار من params
    const filePath = params.path.join('/');
    
    console.log('🔍 طلب صورة:', filePath);
    
    // الأمان: منع الوصول إلى ملفات خارج uploads
    if (filePath.includes('..')) {
      console.log('❌ محاولة وصول غير آمنة:', filePath);
      return new NextResponse('Not Found', { status: 404 });
    }

    // بناء المسار الكامل
    const fullPath = path.join(process.cwd(), 'uploads', filePath);
    
    console.log('📁 المسار الكامل:', fullPath);
    
    // التحقق من وجود الملف
    if (!fs.existsSync(fullPath)) {
      console.log('❌ الملف غير موجود:', fullPath);
      // محاولة البحث في covers إذا كان المسار مباشر
      const coversPath = path.join(process.cwd(), 'uploads', 'covers', filePath);
      if (fs.existsSync(coversPath)) {
        console.log('✅ وجدت الصورة في covers:', coversPath);
        const fileBuffer = fs.readFileSync(coversPath);
        const fileStats = fs.statSync(coversPath);
        const ext = path.extname(coversPath).toLowerCase();
        const contentTypeMap: Record<string, string> = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.webp': 'image/webp',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
        };
        const contentType = contentTypeMap[ext] || 'application/octet-stream';
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Length': fileStats.size.toString(),
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
      return new NextResponse('File Not Found', { status: 404 });
    }

    // قراءة الملف
    const fileBuffer = fs.readFileSync(fullPath);
    const fileStats = fs.statSync(fullPath);
    
    // تحديد نوع الملف
    const ext = path.extname(fullPath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    };
    
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    console.log('✅ إرجاع الصورة:', fullPath, contentType);

    // إرجاع الملف
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileStats.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('❌ خطأ في خدمة الملف:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
