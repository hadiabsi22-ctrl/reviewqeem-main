const express = require('express');
const CommentLocal = require('../models/CommentLocal');
const ReviewLocal = require('../models/ReviewLocal');
const { sanitizeHTML, sanitizeText } = require('../utils/sanitize');

const router = express.Router();
const isDevelopment = process.env.NODE_ENV !== 'production';

// Get comments for a review
router.get('/review/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status = 'approved' } = req.query;

    const query = { reviewId, status };

    const comments = await CommentLocal.find(query)
      .sort({ createdAt: -1 })
      ;

    res.json({
      success: true,
      comments,
      count: comments.length
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب التعليقات'
    });
  }
});

// Create comment
router.post('/', async (req, res) => {
  try {
    // تنظيف المدخلات
    const reviewId = req.body.reviewId;
    const userName = sanitizeText(req.body.userName || '').substring(0, 100);
    const userEmail = (req.body.userEmail || '').toLowerCase().trim().substring(0, 255);
    const content = sanitizeHTML(req.body.content || '');
    const rating = Math.max(0, Math.min(10, parseFloat(req.body.rating) || 0));

    if (!reviewId || !userName || !userEmail || !content) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة'
      });
    }
    
    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني غير صالح'
      });
    }

    // Check if review exists
    const review = await ReviewLocal.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'المراجعة غير موجودة'
      });
    }

    const comment = new CommentLocal({
      reviewId,
      userName,
      userEmail: userEmail.toLowerCase(),
      content,
      rating,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    await comment.save();

    res.status(201).json({
      success: true,
      message: 'تم إرسال التعليق بنجاح. سيتم مراجعته قبل النشر.',
      comment
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إرسال التعليق',
      error: error.message
    });
  }
});

// Like comment
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await CommentLocal.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'التعليق غير موجود'
      });
    }

    res.json({
      success: true,
      likes: comment.likes
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الإعجاب بالتعليق'
    });
  }
});

// Report comment
router.post('/:id/report', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const comment = await CommentLocal.findByIdAndUpdate(
      id,
      {
        $push: {
          reports: {
            reason: reason || 'غير محدد',
            reportedAt: new Date()
          }
        },
        status: 'reported'
      },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'التعليق غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم الإبلاغ عن التعليق بنجاح'
    });
  } catch (error) {
    console.error('Error reporting comment:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الإبلاغ عن التعليق'
    });
  }
});

module.exports = router;
