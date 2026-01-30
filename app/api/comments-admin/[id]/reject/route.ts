// ==================== Reject Comment ====================

import { NextRequest, NextResponse } from 'next/server';
import { CommentLocal } from '@/lib/models/CommentLocal';
import { requireAuthWithParams } from '@/lib/middleware/auth';
import { ApiResponse } from '@/types';
import LocalStorage from '@/lib/storage/localStorage';

async function handler(
  req: NextRequest,
  admin: any,
  params: { params: { id: string } }
) {
  try {
    const { id } = params.params;
    const comment = await CommentLocal.findById(id);

    if (!comment) {
      return NextResponse.json(
        {
          success: false,
          message: 'التعليق غير موجود',
        } as ApiResponse,
        { status: 404 }
      );
    }

    // Delete comment
    const storage = new LocalStorage('comments');
    await storage.delete({ _id: id });

    return NextResponse.json({
      success: true,
      message: 'تم رفض التعليق وحذفه',
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error rejecting comment:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطأ في رفض التعليق',
        error: error.message,
      } as ApiResponse,
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuthWithParams(handler)(req, { params });
}
