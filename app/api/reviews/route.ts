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
      pros: Array.isArray(body.pros) ? body.pros.filter((p: string) => p && p.trim()) : [],
      cons: Array.isArray(body.cons) ? body.cons.filter((c: string) => c && c.trim()) : [],
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

    console.log('📝 Creating review with data:', {
      title: reviewData.title,
      slug: reviewData.slug,
      status: reviewData.status,
      id: reviewData._id,
    });

    const review = new ReviewLocal(reviewData);
    console.log('💾 Attempting to save review...');
    const saveResult = await review.save();
    
    console.log('💾 Save result:', saveResult);
    
    if (!saveResult) {
      console.error('❌ Save failed! Review was not saved.');
      return NextResponse.json(
        {
          success: false,
          message: 'فشل حفظ المراجعة',
        } as ApiResponse,
        { status: 500 }
      );
    }
    
    // التحقق من أن المراجعة تم حفظها - انتظر قليلاً ثم اقرأ
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // جلب جميع المراجعات للتحقق
    const allReviews = await ReviewLocal.find({});
    console.log(`📚 Total reviews after save: ${allReviews.length}`);
    
    const savedReview = allReviews.find(r => {
      const obj = r.toObject();
      return (obj._id || obj.id) === reviewData._id;
    });
    
    console.log('✅ Saved review found:', savedReview ? 'Yes' : 'No');
    if (savedReview) {
      const savedObj = savedReview.toObject();
      const prosCount = Array.isArray(savedObj.pros) ? savedObj.pros.length : 0;
      const consCount = Array.isArray(savedObj.cons) ? savedObj.cons.length : 0;
      const isTheory = prosCount === 0 && consCount === 0;
      
      console.log('📋 Saved review data:', {
        title: savedObj.title,
        status: savedObj.status,
        id: savedObj._id || savedObj.id,
        pros: prosCount,
        cons: consCount,
        type: isTheory ? 'Theory' : 'Review',
      });
    } else {
      console.log('⚠️ Review not found after save!');
      console.log('🔍 Searching for review with ID:', reviewData._id);
      allReviews.forEach((r, idx) => {
        const obj = r.toObject();
        console.log(`  Review ${idx}:`, {
          id: obj._id || obj.id,
          title: obj.title,
          status: obj.status,
        });
      });
    }

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
