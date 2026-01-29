const express = require('express');
const ReviewLocal = require('../models/ReviewLocal');
const { authenticate, isAdmin } = require('../middleware/auth');
const { sanitizeHTML, sanitizeText } = require('../utils/sanitize');
const { logAdminAction } = require('../utils/securityLogger');

const router = express.Router();
const isDevelopment = process.env.NODE_ENV !== 'production';

// Get all reviews (public - only published)
router.get('/published', async (req, res) => {
  try {
    // البحث في جميع المراجعات ثم فلترة يدوياً للتأكد
    let allReviews = await ReviewLocal.find({});
    let reviews = allReviews.filter(r => {
      const reviewData = r.data || r;
      return reviewData.status === 'published';
    });
    
    // Sort by createdAt descending
    reviews = reviews.sort((a, b) => {
      const dateA = new Date((a.data || a).createdAt || 0);
      const dateB = new Date((b.data || b).createdAt || 0);
      return dateB - dateA;
    });
    
    // Convert to plain objects
    reviews = reviews.map(r => r.toObject());

    res.json({
      success: true,
      reviews,
      count: reviews.length
    });
  } catch (error) {
    console.error('Error fetching published reviews:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المراجعات'
    });
  }
});

// Get all reviews (admin only - all statuses)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    // تنظيف و validation للـ query parameters
    const status = req.query.status;
    const search = sanitizeText(req.query.search || '').substring(0, 100);
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    
    const query = {};

    if (status && status !== 'all' && ['draft', 'published', 'archived'].includes(status)) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { gameName: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    let reviews = await ReviewLocal.find(query);
    
    // Sort by createdAt descending
    reviews = reviews.sort((a, b) => {
      const dateA = new Date(a.data.createdAt || 0);
      const dateB = new Date(b.data.createdAt || 0);
      return dateB - dateA;
    });
    
    // Apply pagination
    const total = reviews.length;
    reviews = reviews.slice(skip, skip + limitNum);
    
    // Convert to plain objects
    reviews = reviews.map(r => r.toObject());

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المراجعات'
    });
  }
});

// Get single review by ID or slug (متوافق مع التخزين المحلي وليس MongoDB)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const decodedId = decodeURIComponent(id);
    const isAdminRequest = !!req.headers.authorization;

    console.log('🔍 البحث عن مراجعة:', { id, decodedId });

    // في التخزين المحلي، الـ _id عبارة عن نص عشوائي (ليس ObjectId بطول 24)
    // لذلك نحاول البحث بعدة طرق: أولاً _id ثم id ثم slug
    let review =
      (await ReviewLocal.findOne({ _id: decodedId })) ||
      (await ReviewLocal.findOne({ id: decodedId })) ||
      (await ReviewLocal.findOne({ slug: decodedId }));

    // إذا لم نجد بالبحث المباشر، نبحث في جميع المراجعات يدوياً
    // (للتأكد من البحث في data._id و data.slug)
    if (!review) {
      console.log('🔍 البحث اليدوي في جميع المراجعات...');
      const allReviews = await ReviewLocal.find({});
      console.log('📊 عدد المراجعات:', allReviews.length);
      
      for (const r of allReviews) {
        const reviewData = r.data || r;
        const reviewId = reviewData._id || reviewData.id;
        const reviewSlug = reviewData.slug;
        
        if (reviewId === decodedId || reviewId === id || 
            reviewSlug === decodedId || reviewSlug === id) {
          review = r;
          console.log('✅ تم العثور على المراجعة:', { id: reviewId, slug: reviewSlug });
          break;
        }
      }
    }

    // لو لم نجد أي مراجعة
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'المراجعة غير موجودة'
      });
    }

    // إذا كانت المراجعة لا تحتوي على slug، نولد واحداً تلقائياً
    if (!review.data.slug && review.data.title) {
      review.data.slug = review.data.title
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
        .replace(/^-+|-+$/g, '');
      await review.save();
    }

    // لو الزائر من الواجهة العامة (بدون Authorization) نعرض فقط المنشور
    if (!isAdminRequest && review.data.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'المراجعة غير موجودة أو غير منشورة'
      });
    }

    // زيادة عدد المشاهدات
    review.data.views = (review.data.views || 0) + 1;
    await review.save();

    res.json({
      success: true,
      review: review.toObject()
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المراجعة'
    });
  }
});

// Create new review (admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    console.log('📥 استلام بيانات مراجعة جديدة:', req.body);
    
    // تنظيف البيانات والتأكد من الحقول المطلوبة
    const reviewData = {
      title: sanitizeText(req.body.title || '').substring(0, 200),
      gameName: sanitizeText(req.body.gameName || req.body.title || '').substring(0, 200),
      content: sanitizeHTML(req.body.content || ''),
      summary: sanitizeText(req.body.summary || '').substring(0, 500),
      rating: Math.max(0, Math.min(10, parseFloat(req.body.rating) || 0)),
      globalRating: Math.max(0, Math.min(10, parseFloat(req.body.globalRating || req.body.rating) || 0)),
      pros: Array.isArray(req.body.pros) ? req.body.pros : [],
      cons: Array.isArray(req.body.cons) ? req.body.cons : [],
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      cover_image: req.body.cover_image || req.body.coverImage || req.body.mainImage || '',
      coverImage: req.body.cover_image || req.body.coverImage || req.body.mainImage || '',
      mainImage: req.body.cover_image || req.body.coverImage || req.body.mainImage || '',
      screenshots: Array.isArray(req.body.screenshots) ? req.body.screenshots : [],
      status: ['draft', 'published', 'archived'].includes(req.body.status) ? req.body.status : 'draft',
      comments_enabled: req.body.comments_enabled !== undefined ? req.body.comments_enabled : true,
      author: req.admin._id || req.admin.id,
      views: 0,
      likes: 0
    };

    console.log('📝 بيانات المراجعة بعد التنظيف:', reviewData);

    const review = new ReviewLocal(reviewData);
    await review.save();

    console.log('✅ تم حفظ المراجعة بنجاح:', review.data._id);
    
    // تسجيل النشاط الإداري
    logAdminAction('create_review', req.admin._id || req.admin.id, {
      reviewId: review.data._id,
      title: reviewData.title,
      ip: req.ip
    });

    // Update sitemap after creating review
    try {
      const { generateSitemap } = require('../utils/generateSitemap');
      await generateSitemap();
    } catch (sitemapError) {
      console.warn('⚠️  تحذير: فشل تحديث sitemap.xml:', sitemapError.message);
    }

    res.status(201).json({
      success: true,
      message: 'تم إنشاء المراجعة بنجاح',
      review: review.toObject()
    });
  } catch (error) {
    console.error('❌ خطأ في إنشاء المراجعة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء المراجعة',
      error: isDevelopment ? error.message : undefined
    });
  }
});

// Update review (admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };

    const review = await ReviewLocal.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'المراجعة غير موجودة'
      });
    }

    // Update sitemap after updating review
    try {
      const { generateSitemap } = require('../utils/generateSitemap');
      await generateSitemap();
    } catch (sitemapError) {
      console.warn('⚠️  تحذير: فشل تحديث sitemap.xml:', sitemapError.message);
    }

    res.json({
      success: true,
      message: 'تم تحديث المراجعة بنجاح',
      review: review ? review.toObject() : null
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث المراجعة',
      error: error.message
    });
  }
});

// Delete review (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const review = await ReviewLocal.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'المراجعة غير موجودة'
      });
    }

    // Update sitemap after deleting review
    try {
      const { generateSitemap } = require('../utils/generateSitemap');
      await generateSitemap();
    } catch (sitemapError) {
      console.warn('⚠️  تحذير: فشل تحديث sitemap.xml:', sitemapError.message);
    }

    res.json({
      success: true,
      message: 'تم حذف المراجعة بنجاح'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف المراجعة'
    });
  }
});

// Update review status (admin only)
router.patch('/:id/status', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'حالة غير صالحة'
      });
    }

    const review = await ReviewLocal.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'المراجعة غير موجودة'
      });
    }

    res.json({
      success: true,
      message: 'تم تحديث حالة المراجعة بنجاح',
      review
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث حالة المراجعة'
    });
  }
});

module.exports = router;
