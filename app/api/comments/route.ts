// ==================== Create Comment ====================

import { NextRequest, NextResponse } from 'next/server';
import { CommentLocal } from '@/lib/models/CommentLocal';
import { ReviewLocal } from '@/lib/models/ReviewLocal';
import { sanitizeHTML, sanitizeText } from '@/lib/utils/sanitize';
import { ApiResponse, Comment } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // تنظيف المدخلات
    const reviewId = body.reviewId;
    const userName = sanitizeText(body.userName || '').substring(0, 100);
    const userEmail = (body.userEmail || '').toLowerCase().trim().substring(0, 255);
    const content = sanitizeHTML(body.content || '');
    const rating = Math.max(0, Math.min(10, parseFloat(body.rating) || 0));

    if (!reviewId || !userName || !userEmail || !content) {
      return NextResponse.json(
        {
          success: false,
          message: 'جميع الحقول مطلوبة',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: 'البريد الإلكتروني غير صالح',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Check if review exists
    const review = await ReviewLocal.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        {
          success: false,
          message: 'المراجعة غير موجودة',
        } as ApiResponse,
        { status: 404 }
      );
    }

    const comment = new CommentLocal({
      reviewId,
      userName,
      userEmail: userEmail.toLowerCase(),
      content,
      rating,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    await comment.save();

    return NextResponse.json(
      {
        success: true,
        message: 'تم إرسال التعليق بنجاح. سيتم مراجعته قبل النشر.',
        data: comment.toObject(),
      } as ApiResponse<Comment>,
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطأ في إرسال التعليق',
        error: error.message,
      } as ApiResponse,
      { status: 500 }
    );
  }
}
