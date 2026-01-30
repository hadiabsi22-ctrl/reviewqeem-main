// ==================== Get, Update, Delete Review ====================

import { NextRequest, NextResponse } from 'next/server';
import { ReviewLocal } from '@/lib/models/ReviewLocal';
import { requireAuthWithParams } from '@/lib/middleware/auth';
import { Review, ApiResponse } from '@/types';
import { sanitizeHTML, sanitizeText } from '@/lib/utils/sanitize';

async function getHandler(req: NextRequest, admin: any, params: { params: { id: string } }) {
  try {
    const { id } = params.params;
    const review = await ReviewLocal.findById(id);

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          message: 'المراجعة غير موجودة',
        } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      review: review.toObject(),
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطأ في جلب المراجعة',
        error: error.message,
      } as ApiResponse,
      { status: 500 }
    );
  }
}

async function updateHandler(req: NextRequest, admin: any, params: { params: { id: string } }) {
  try {
    const { id } = params.params;
    const review = await ReviewLocal.findById(id);

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          message: 'المراجعة غير موجودة',
        } as ApiResponse,
        { status: 404 }
      );
    }

    const body = await req.json();

    // Check if slug is being changed and if it's already taken
    if (body.slug && body.slug !== review.toObject().slug) {
      const existingReview = await ReviewLocal.findOne({ slug: body.slug });
      if (existingReview && existingReview._id !== id) {
        return NextResponse.json(
          {
            success: false,
            message: 'الرابط (slug) مستخدم بالفعل',
          } as ApiResponse,
          { status: 400 }
        );
      }
    }

    // Update review data
    const updateData: Partial<Review> = {
      title: body.title ? sanitizeText(body.title) : review.toObject().title,
      slug: body.slug ? sanitizeText(body.slug).toLowerCase().replace(/[^a-z0-9-]/g, '-') : review.toObject().slug,
      gameTitle: body.title ? sanitizeText(body.title) : review.toObject().gameTitle,
      gameSlug: body.slug ? sanitizeText(body.slug).toLowerCase().replace(/[^a-z0-9-]/g, '-') : review.toObject().gameSlug,
      summary: body.summary ? sanitizeText(body.summary) : review.toObject().summary,
      content: body.content ? sanitizeHTML(body.content) : review.toObject().content,
      rating: body.rating !== undefined ? Math.max(0, Math.min(10, parseFloat(body.rating) || 0)) : review.toObject().rating,
      tags: Array.isArray(body.genre) ? body.genre : (Array.isArray(body.tags) ? body.tags : review.toObject().tags),
      category: Array.isArray(body.genre) && body.genre.length > 0 ? body.genre[0] : review.toObject().category,
      pros: Array.isArray(body.pros) ? body.pros.filter(p => p.trim()) : (review.toObject().pros || []),
      cons: Array.isArray(body.cons) ? body.cons.filter(c => c.trim()) : (review.toObject().cons || []),
      status: body.status || review.toObject().status,
      featured: body.featured !== undefined ? body.featured : review.toObject().featured,
      coverImage: body.coverImage !== undefined ? body.coverImage : review.toObject().coverImage,
      screenshots: Array.isArray(body.gallery) ? body.gallery : (Array.isArray(body.screenshots) ? body.screenshots : review.toObject().screenshots),
      updatedAt: new Date().toISOString(),
    };

    const updatedReview = await ReviewLocal.findByIdAndUpdate(id, updateData);

    return NextResponse.json({
      success: true,
      message: 'تم تحديث المراجعة بنجاح',
      review: updatedReview?.toObject(),
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطأ في تحديث المراجعة',
        error: error.message,
      } as ApiResponse,
      { status: 500 }
    );
  }
}

async function deleteHandler(req: NextRequest, admin: any, params: { params: { id: string } }) {
  try {
    const { id } = params.params;
    const review = await ReviewLocal.findById(id);

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          message: 'المراجعة غير موجودة',
        } as ApiResponse,
        { status: 404 }
      );
    }

    await ReviewLocal.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'تم حذف المراجعة بنجاح',
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطأ في حذف المراجعة',
        error: error.message,
      } as ApiResponse,
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  return requireAuthWithParams(getHandler)(req, context);
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  return requireAuthWithParams(updateHandler)(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  return requireAuthWithParams(deleteHandler)(req, context);
}
