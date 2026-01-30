// ==================== Authentication Middleware ====================

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { AdminLocal } from '@/lib/models/AdminLocal';

const JWT_SECRET = process.env.JWT_SECRET || '';

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET is required in production');
}

export interface AuthRequest extends NextRequest {
  admin?: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

export async function authenticate(request: NextRequest): Promise<{
  success: boolean;
  admin?: any;
  error?: string;
}> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.replace('Bearer ', '') 
      : null;

    if (!token) {
      return {
        success: false,
        error: 'لم يتم توفير رمز المصادقة',
      };
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const admin = await AdminLocal.findById(decoded.id);

    if (!admin) {
      return {
        success: false,
        error: 'المستخدم غير موجود',
      };
    }

    return {
      success: true,
      admin: admin.toObject(),
    };
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return {
        success: false,
        error: 'رمز المصادقة غير صالح',
      };
    }
    if (error.name === 'TokenExpiredError') {
      return {
        success: false,
        error: 'انتهت صلاحية رمز المصادقة',
      };
    }
    return {
      success: false,
      error: 'خطأ في التحقق من المصادقة',
    };
  }
}

export function requireAuth(
  handler: (req: NextRequest, admin: any) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const auth = await authenticate(req);
    
    if (!auth.success || !auth.admin) {
      return NextResponse.json(
        {
          success: false,
          message: auth.error || 'غير مصرح بالوصول',
        },
        { status: 401 }
      );
    }

    return handler(req, auth.admin);
  };
}

// Helper for routes with params
export function requireAuthWithParams(
  handler: (req: NextRequest, admin: any, params: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, params: any) => {
    const auth = await authenticate(req);
    
    if (!auth.success || !auth.admin) {
      return NextResponse.json(
        {
          success: false,
          message: auth.error || 'غير مصرح بالوصول',
        },
        { status: 401 }
      );
    }

    return handler(req, auth.admin, params);
  };
}
