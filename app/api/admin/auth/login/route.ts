// ==================== Admin Login ====================

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { AdminLocal } from '@/lib/models/AdminLocal';
import { ApiResponse } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || '';

if (!JWT_SECRET) {
  console.error('❌ خطأ أمني: يجب تعيين JWT_SECRET في ملف .env');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

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

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        token,
        admin: admin.toObject(),
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error in login:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء تسجيل الدخول',
        error: error.message,
      } as ApiResponse,
      { status: 500 }
    );
  }
}
