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
    const { email, password } = body;
    
    console.log('📧 Login attempt for:', email);

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'البريد الإلكتروني وكلمة المرور مطلوبان',
        } as ApiResponse,
        { status: 400 }
      );
    }

    const admin = await AdminLocal.findByEmail(email.toLowerCase().trim());

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        } as ApiResponse,
        { status: 401 }
      );
    }

    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        } as ApiResponse,
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { id: admin.id || admin._id, email: admin.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for:', email);
    
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
