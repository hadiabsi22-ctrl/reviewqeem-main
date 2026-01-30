// ==================== Upload Single Image ====================

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';
import crypto from 'crypto';

async function handler(req: NextRequest, admin: any) {
  try {
    if (req.method !== 'POST') {
      return NextResponse.json(
        { success: false, message: 'Method not allowed' },
        { status: 405 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'لم يتم توفير ملف' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'الملف يجب أن يكون صورة' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'حجم الملف كبير جداً (الحد الأقصى 10MB)' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${crypto.randomBytes(16).toString('hex')}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process image with sharp (resize, optimize)
    let processedBuffer = buffer;
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      // Resize if too large (max width 1920px)
      if (metadata.width && metadata.width > 1920) {
        processedBuffer = await image
          .resize(1920, null, { withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
      } else {
        // Just optimize
        processedBuffer = await image
          .jpeg({ quality: 85 })
          .toBuffer();
      }
    } catch (error) {
      console.warn('Image processing failed, using original:', error);
      processedBuffer = buffer;
    }

    // Save file
    await writeFile(filePath, processedBuffer);

    // Return URL
    const url = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      message: 'تم رفع الصورة بنجاح',
      url,
      fileName,
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطأ في رفع الصورة',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(handler);
