// ==================== Edit Comment ====================

import { NextRequest, NextResponse } from 'next/server';
import { CommentLocal } from '@/lib/models/CommentLocal';
import { requireAuthWithParams } from '@/lib/middleware/auth';
import { ApiResponse } from '@/types';
import { sanitizeHTML } from '@/lib/utils/sanitize';

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

    const body = await req.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'محتوى التعليق مطلوب',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Update comment content
    Object.assign(comment.data, { 
      content: sanitizeHTML(content),
      updatedAt: new Date().toISOString()
    });
    await comment.save();

    return NextResponse.json({
      success: true,
      message: 'تم تحديث التعليق بنجاح',
      data: comment.toObject(),
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error editing comment:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطأ في تحديث التعليق',
        error: error.message,
      } as ApiResponse,
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return requireAuthWithParams(handler)(req, { params });
}
