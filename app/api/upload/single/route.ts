// ==================== Upload Single Image ====================

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { supabase } from '@/lib/supabase';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';
import crypto from 'crypto';

async function handler(req: NextRequest, admin: any) {
  console.log('📤 Upload request received');
  console.log('👤 Admin:', admin?.email || 'Unknown');
  console.log('🔍 Supabase configured:', !!supabase);
  console.log('🌐 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
  console.log('🔑 Supabase Key:', process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
  
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

    // Generate unique filename with folder organization
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(16).toString('hex');
    const fileName = `${randomHash}-${timestamp}.${fileExtension}`;
    
    // Determine folder based on usage (can be passed as query param or default to 'general')
    const url = new URL(req.url);
    const folder = url.searchParams.get('folder') || 'general'; // 'covers', 'content', 'general'
    const folderPath = folder === 'covers' ? 'covers/' : folder === 'content' ? 'content/' : '';

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer as ArrayBuffer);

    // Process image with sharp (resize, optimize)
    let processedBuffer: Buffer = buffer;
    let finalFileName = fileName;
    
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
        finalFileName = fileName.replace(/\.[^.]+$/, '.webp');
      }
    } catch (error: any) {
      console.warn('Image processing failed, using original:', error.message);
      processedBuffer = buffer;
    }

    // Upload to Supabase Storage if available, otherwise use local storage
    // يمكن تحديد اسم الحاوية من متغير البيئة أو استخدام الافتراضي
    const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'game_reviews'; // اسم الحاوية في Supabase
    const USE_SUPABASE = process.env.USE_SUPABASE !== 'false' && supabase; // يمكن تعطيل Supabase عبر env
    
    if (USE_SUPABASE) {
      try {
        console.log('☁️ Uploading to Supabase Storage...');
        console.log('📦 Bucket name:', BUCKET_NAME);
        console.log('📁 Folder path:', folderPath);
        console.log('📄 File name:', finalFileName);
        console.log('📊 File size:', processedBuffer.length, 'bytes');
        
        const uploadPath = folderPath ? `${folderPath}${finalFileName}` : finalFileName;
        console.log('📤 Upload path:', uploadPath);
        
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(uploadPath, processedBuffer, {
            contentType: processedBuffer.length > 0 ? `image/${finalFileName.split('.').pop() === 'png' ? 'png' : 'webp'}` : file.type,
            upsert: false,
          });

        if (error) {
          console.error('❌ Supabase upload error:', error);
          console.error('❌ Error details:', JSON.stringify(error, null, 2));
          // Fallback to local storage if Supabase fails
          console.log('⚠️ Falling back to local storage due to Supabase error');
          throw new Error(`Supabase upload failed: ${error.message}`);
        }

        console.log('✅ Upload successful, getting public URL...');

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(uploadPath);

        console.log('✅ File uploaded to Supabase:', urlData.publicUrl);

        return NextResponse.json({
          success: true,
          message: 'تم رفع الصورة بنجاح',
          url: urlData.publicUrl,
          fileName: finalFileName,
        });
      } catch (supabaseError: any) {
        console.error('❌ Supabase error, falling back to local storage:', supabaseError);
        console.error('❌ Error message:', supabaseError.message);
        console.error('❌ Error stack:', supabaseError.stack);
        // Continue to local storage fallback
      }
    } else {
      console.log('ℹ️ Supabase disabled or not configured, using local storage');
    }
    
    // Fallback to local storage (always available)
    console.log('💾 Saving file locally (Supabase not configured or failed)...');
    
    // Create uploads directory with folder structure if it doesn't exist
    const isVercel = process.env.VERCEL === '1';
    const uploadsDir = isVercel 
      ? join('/tmp', 'uploads', folderPath)
      : join(process.cwd(), 'uploads', folderPath);
    
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const filePath = join(uploadsDir, finalFileName);
    await writeFile(filePath, processedBuffer);
    console.log('✅ File saved locally');

    // Return URL - use /api/uploads/ for serving files with folder path
    const url = folderPath ? `/api/uploads/${folderPath}${finalFileName}` : `/api/uploads/${finalFileName}`;
    console.log('🔗 File URL:', url);

    return NextResponse.json({
      success: true,
      message: 'تم رفع الصورة بنجاح',
      url,
      fileName: finalFileName,
    });
  } catch (error: any) {
    console.error('❌ Error uploading image:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      path: error.path,
      name: error.name,
    });
    
    // Return detailed error in development, generic in production
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `خطأ في رفع الصورة: ${error.message}` 
      : 'خطأ في رفع الصورة';
    
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          code: error.code,
          name: error.name,
        } : undefined,
      },
      { status: 500 }
    );
  }
}

export const POST = requireAuth(handler);
