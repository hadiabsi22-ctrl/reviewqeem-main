// ==================== Approve Comment ====================

import { NextRequest, NextResponse } from 'next/server';
import { CommentLocal } from '@/lib/models/CommentLocal';
import { requireAuthWithParams } from '@/lib/middleware/auth';
import { ApiResponse } from '@/types';

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

    // Update status using findByIdAndUpdate
    const updatedComment = await CommentLocal.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true }
    );

    if (!updatedComment) {
      return NextResponse.json(
        {
          success: false,
          message: 'فشل تحديث التعليق',
        } as ApiResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تمت الموافقة على التعليق',
      data: updatedComment.toObject(),
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error approving comment:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطأ في الموافقة على التعليق',
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
