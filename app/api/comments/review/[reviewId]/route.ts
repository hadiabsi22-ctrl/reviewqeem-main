// ==================== Get Comments for Review ====================

import { NextRequest, NextResponse } from 'next/server';
import { CommentLocal } from '@/lib/models/CommentLocal';
import { CommentsResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    const { reviewId } = params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'approved';

    if (!reviewId) {
      return NextResponse.json(
        {
          success: false,
          message: 'معرّف المراجعة مطلوب',
        } as CommentsResponse,
        { status: 400 }
      );
    }

    // تأكد من أن البحث يتم بشكل صحيح في قاعدة البيانات
    let commentModels = await CommentLocal.find({
      reviewId: reviewId,
      status: status as any,
    });
    let comments = commentModels.map((c) => c.toObject());

    // الفرز بالتاريخ (الأحدث أولاً)
    comments.sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return db - da; // ترتيب تنازلي (الأحدث أولاً)
    });

    return NextResponse.json({
      success: true,
      comments: comments || [],
      count: comments ? comments.length : 0,
    } as CommentsResponse);
  } catch (error: any) {
    // هذا سيظهر للمبرمج سبب المشكلة الحقيقي في الـ Terminal
    console.error('❌ Error fetching comments:', error);
    console.error('❌ Error stack:', error.stack);

    const isDevelopment =
      (process.env.NODE_ENV || 'development').toLowerCase() === 'development';

    return NextResponse.json(
      {
        success: false,
        message: 'خطأ داخلي في السيرفر',
        error: isDevelopment ? error.message : undefined,
      } as CommentsResponse,
      { status: 500 }
    );
  }
}
