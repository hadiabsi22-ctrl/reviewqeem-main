// ==================== Admin Login ====================

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { AdminLocal } from '@/lib/models/AdminLocal';
import { ApiResponse } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || '';

if (!JWT_SECRET) {
  console.error('❌ خطأ أمني: يجب تعيين JWT_SECRET في ملف .env');
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: 'Method not allowed. Use POST.',
    } as ApiResponse,
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  console.log('🔐 POST /api/admin/auth/login - Request received');
  
  try {
    const body = await request.json();
    const { password } = body;
    
    console.log('🔑 Login attempt with password');

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: 'كلمة المرور مطلوبة',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // البحث عن جميع الأدمن والتحقق من كلمة المرور
    const admins = await AdminLocal.find({});
    
    console.log(`📊 Found ${admins.length} admin(s)`);
    
    if (admins.length === 0) {
      console.log('❌ No admins found in database');
      return NextResponse.json(
        {
          success: false,
          message: 'كلمة المرور غير صحيحة',
        } as ApiResponse,
        { status: 401 }
      );
    }

    // التحقق من كلمة المرور مع جميع الأدمن
    let admin: AdminLocal | null = null;
    for (const a of admins) {
      console.log(`🔍 Checking admin: ${a.email || a.username || 'unknown'}`);
      console.log(`🔍 Admin ID: ${a.id || a._id}`);
      
      try {
        // التحقق من كلمة المرور مباشرة
        const isPasswordValid = await a.comparePassword(password);
        console.log(`🔑 Password check result: ${isPasswordValid}`);
        console.log(`🔑 Password entered: ${password.substring(0, 5)}...`);
        
        if (isPasswordValid) {
          admin = a;
          console.log(`✅ Password matched for admin: ${a.email || a.username}`);
          break;
        } else {
          console.log(`❌ Password did not match for admin: ${a.email || a.username}`);
        }
      } catch (err: any) {
        console.error(`❌ Error checking admin ${a.email}:`, err.message);
        console.error(`❌ Error stack:`, err.stack);
        continue;
      }
    }

    if (!admin) {
      console.log('❌ Password incorrect for all admins');
      console.log(`💡 Expected password: ReviewQeem2026`);
      return NextResponse.json(
        {
          success: false,
          message: 'كلمة المرور غير صحيحة',
        } as ApiResponse,
        { status: 401 }
      );
    }

    console.log('✅ Admin found:', admin.email);
    console.log('🔑 Password validation result: true');

    const token = jwt.sign(
      { id: admin.id || admin._id, email: admin.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful');
    
    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        token,
        admin: admin.toObject(),
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('❌ Error in login:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء تسجيل الدخول',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      } as ApiResponse,
      { status: 500 }
    );
  }
}
