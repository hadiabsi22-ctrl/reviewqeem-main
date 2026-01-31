// ==================== Upload Single Image ====================

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';
import crypto from 'crypto';

async function handler(req: NextRequest, admin: any) {
  console.log('📤 Upload request received');
  
  try {
    if (req.method !== 'POST') {
      return NextResponse.json(
        { success: false, message: 'Method not allowed' },
        { status: 405 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('image') as File;

    console.log('📁 File received:', file?.name, file?.type, file?.size);

    if (!file) {
      console.log('❌ No file provided');
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
    // In Vercel, use /tmp for temporary files, otherwise use uploads/
    const isVercel = process.env.VERCEL === '1';
    const uploadsDir = isVercel 
      ? join('/tmp', 'uploads')
      : join(process.cwd(), 'uploads');
    
    console.log('📂 Upload directory:', uploadsDir);
    console.log('🌐 Is Vercel:', isVercel);
    
    if (!existsSync(uploadsDir)) {
      console.log('📁 Creating upload directory...');
      await mkdir(uploadsDir, { recursive: true });
      console.log('✅ Directory created');
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    let fileName = `${crypto.randomBytes(16).toString('hex')}-${Date.now()}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer as ArrayBuffer);

    // Process image with sharp (resize, optimize)
    let processedBuffer: Buffer = buffer;
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();

      // Convert to webp for better compression
      const outputFormat = fileExtension.toLowerCase() === 'png' ? 'png' : 'webp';
      
      // Resize if too large (max width 1920px)
      if (metadata.width && metadata.width > 1920) {
        if (outputFormat === 'webp') {
          processedBuffer = await image
            .resize(1920, null, { withoutEnlargement: true })
            .webp({ quality: 85 })
            .toBuffer() as Buffer;
        } else {
          processedBuffer = await image
            .resize(1920, null, { withoutEnlargement: true })
            .png({ quality: 85 })
            .toBuffer() as Buffer;
        }
      } else {
        // Just optimize
        if (outputFormat === 'webp') {
          processedBuffer = await image
            .webp({ quality: 85 })
            .toBuffer() as Buffer;
        } else {
          processedBuffer = await image
            .png({ quality: 85 })
            .toBuffer() as Buffer;
        }
      }
      
      // Update file extension if converted to webp
      if (outputFormat === 'webp' && fileExtension !== 'webp') {
        fileName = fileName.replace(/\.[^.]+$/, '.webp');
      }
    } catch (error: any) {
      console.warn('Image processing failed, using original:', error.message);
      processedBuffer = buffer;
    }

    // Save file
    console.log('💾 Saving file to:', filePath);
    await writeFile(filePath, processedBuffer);
    console.log('✅ File saved successfully');

    // Return URL - use /api/uploads/ for serving files
    const url = `/api/uploads/${fileName}`;
    console.log('🔗 File URL:', url);

    return NextResponse.json({
      success: true,
      message: 'تم رفع الصورة بنجاح',
      url,
      fileName,
    });
  } catch (error: any) {
    console.error('❌ Error uploading image:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      path: error.path,
    });
    return NextResponse.json(
      {
        success: false,
        message: 'خطأ في رفع الصورة',
        error: process.env.NODE_ENV === 'development' ? error.message : 'خطأ في رفع الصورة',
      },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(handler);
