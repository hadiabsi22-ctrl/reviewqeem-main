// ==================== Update Admin Account ====================

import { NextRequest, NextResponse } from 'next/server';
import { AdminLocal } from '@/lib/models/AdminLocal';
import { requireAuth } from '@/lib/middleware/auth';
import { ApiResponse } from '@/types';
import { sanitizeText } from '@/lib/utils/sanitize';

async function handler(req: NextRequest, admin: any) {
  try {
    if (req.method !== 'PUT') {
      return NextResponse.json(
        {
          success: false,
          message: 'Method not allowed',
        } as ApiResponse,
        { status: 405 }
      );
    }

    const body = await req.json();
    const { username, email } = body;

    if (!username || !email) {
      return NextResponse.json(
        {
          success: false,
          message: 'اسم المستخدم والبريد الإلكتروني مطلوبان',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'البريد الإلكتروني غير صالح',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Check if email is already taken by another admin
    const existingAdmin = await AdminLocal.findByEmail(email);
    if (existingAdmin && existingAdmin._id !== admin.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'البريد الإلكتروني مستخدم بالفعل',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Get current admin
    const currentAdmin = await AdminLocal.findById(admin.id);
    if (!currentAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: 'المستخدم غير موجود',
        } as ApiResponse,
        { status: 404 }
      );
    }

    // Update admin data
    const adminData = currentAdmin.toObject();
    adminData.username = sanitizeText(username);
    adminData.email = email.toLowerCase().trim();

    const updatedAdmin = new AdminLocal(adminData);
    await updatedAdmin.save();

    return NextResponse.json({
      success: true,
      message: 'تم تحديث معلومات الحساب بنجاح',
      data: {
        admin: updatedAdmin.toObject(),
      },
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطأ في تحديث معلومات الحساب',
        error: error.message,
      } as ApiResponse,
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(handler);
