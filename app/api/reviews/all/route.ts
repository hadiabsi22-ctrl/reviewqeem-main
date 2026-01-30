// ==================== Get All Reviews (Admin) ====================

import { NextRequest, NextResponse } from 'next/server';
import { ReviewLocal } from '@/lib/models/ReviewLocal';
import { requireAuth } from '@/lib/middleware/auth';
import { ReviewsResponse } from '@/types';

async function handler(req: NextRequest, admin: any) {
  try {
    const reviews = await ReviewLocal.find({});
    const sorted = reviews
      .map((r) => r.toObject())
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

    return NextResponse.json({
      success: true,
      reviews: sorted,
      count: sorted.length,
    } as ReviewsResponse);
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطأ في جلب المراجعات',
        error: error.message,
      } as ReviewsResponse,
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handler);
