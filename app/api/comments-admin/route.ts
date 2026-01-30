// ==================== Get All Comments (Admin) ====================

import { NextRequest, NextResponse } from 'next/server';
import { CommentLocal } from '@/lib/models/CommentLocal';
import { requireAuth } from '@/lib/middleware/auth';
import { CommentsResponse } from '@/types';

async function handler(req: NextRequest, admin: any) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const comments = await CommentLocal.find(query);
    const sorted = comments
      .map((c) => c.toObject())
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

    return NextResponse.json({
      success: true,
      comments: sorted,
      count: sorted.length,
    } as CommentsResponse);
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطأ في جلب التعليقات',
        error: error.message,
      } as CommentsResponse,
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handler);
