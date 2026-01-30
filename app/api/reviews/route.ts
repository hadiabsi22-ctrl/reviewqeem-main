// ==================== Create Review ====================

import { NextRequest, NextResponse } from 'next/server';
import { ReviewLocal } from '@/lib/models/ReviewLocal';
import { requireAuth } from '@/lib/middleware/auth';
import { Review, ApiResponse } from '@/types';
import { sanitizeHTML, sanitizeText } from '@/lib/utils/sanitize';
import crypto from 'crypto';

async function handler(req: NextRequest, admin: any) {
  try {
    if (req.method !== 'POST') {
      return NextResponse.json(
        {
          success: false,
          message: 'Method not allowed',
        } as ApiResponse,
        { status: 405 }
      );
    }

    const body = await req.json();
    
    // Validate required fields
    if (!body.title || !body.slug || !body.summary || !body.content) {
      return NextResponse.json(
        {
          success: false,
          message: 'جميع الحقول المطلوبة يجب أن تكون مملوءة',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingReview = await ReviewLocal.findOne({ slug: body.slug });
    if (existingReview) {
      return NextResponse.json(
        {
          success: false,
          message: 'الرابط (slug) مستخدم بالفعل',
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Sanitize inputs
    const reviewData: Review = {
      _id: crypto.randomBytes(16).toString('hex'),
      id: '',
      title: sanitizeText(body.title),
      slug: sanitizeText(body.slug).toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      gameTitle: sanitizeText(body.title), // Use title as gameTitle
      gameSlug: sanitizeText(body.slug).toLowerCase().replace(/[^a-z0-9-]/g, '-'), // Use slug as gameSlug
      summary: sanitizeText(body.summary),
      content: sanitizeHTML(body.content),
      rating: Math.max(0, Math.min(10, parseFloat(body.rating) || 0)),
      tags: Array.isArray(body.genre) ? body.genre : [],
      category: Array.isArray(body.genre) && body.genre.length > 0 ? body.genre[0] : '',
      pros: Array.isArray(body.pros) ? body.pros.filter((p: string) => p.trim()) : [],
      cons: Array.isArray(body.cons) ? body.cons.filter((c: string) => c.trim()) : [],
      status: body.status || 'draft',
      featured: body.featured === true,
      coverImage: body.coverImage || '',
      screenshots: [],
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: admin.username || admin.email,
    };

    reviewData.id = reviewData._id;

    const review = new ReviewLocal(reviewData);
    await review.save();

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء المراجعة بنجاح',
      data: review.toObject(),
    } as ApiResponse);
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطأ في إنشاء المراجعة',
        error: error.message,
      } as ApiResponse,
      { status: 500 }
    );
  }
}

export const POST = requireAuth(handler);
