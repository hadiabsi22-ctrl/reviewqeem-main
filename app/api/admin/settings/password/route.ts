// ==================== Update Admin Password ====================

import { NextRequest, NextResponse } from 'next/server';
import { AdminLocal } from '@/lib/models/AdminLocal';
import { requireAuth } from '@/lib/middleware/auth';
import { ApiResponse } from '@/types';

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
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'كلمة المرور الحالية والجديدة مطلوبتان',
        } as ApiResponse,
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
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

    // Verify current password
    const isPasswordValid = await currentAdmin.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'كلمة المرور الحالية غير صحيحة',
        } as ApiResponse,
        { status: 401 }
      );
    }

    // Update password
    const adminData = currentAdmin.toObject();
    adminData.password = newPassword; // Will be hashed in save()

    const updatedAdmin = new AdminLocal(adminData);
    await updatedAdmin.save();

    return NextResponse.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح',
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطأ في تغيير كلمة المرور',
        error: error.message,
      } as ApiResponse,
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(handler);
