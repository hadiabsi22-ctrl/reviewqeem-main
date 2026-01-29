const express = require('express');
const CommentLocal = require('../models/CommentLocal');
const ReviewLocal = require('../models/ReviewLocal');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

// Get all comments with filters
router.get('/', async (req, res) => {
  try {
    const { status, reviewId, sort = 'newest', page = 1, limit = 50 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (reviewId && reviewId !== 'all') {
      query.reviewId = reviewId;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'likes') {
      sortOption = { likes: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // في التخزين المحلي CommentLocal.find يعيد مصفوفة، لذلك نطبق الفرز والتقسيم يدوياً
    let commentModels = await CommentLocal.find(query);        // [CommentLocal, ...]
    let commentsArray = commentModels.map(c => c.toObject());  // نحولها إلى كائنات عادية

    // الفرز
    commentsArray.sort((a, b) => {
      if (sortOption.likes) {
        // فرز بالإعجابات
        const la = a.likes || 0;
        const lb = b.likes || 0;
        return sortOption.likes === -1 ? lb - la : la - lb;
      }

      // الفرز بالتاريخ (createdAt)
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return sortOption.createdAt === 1 ? da - db : db - da;
    });

    const total = commentsArray.length;

    // التقسيم (Pagination)
    const comments = commentsArray.slice(skip, skip + limitNum);

    res.json({
      success: true,
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب التعليقات'
    });
  }
});

// Get pending comments
router.get('/pending', async (req, res) => {
  try {
    let pendingModels = await CommentLocal.find({ status: 'pending' });
    let comments = pendingModels.map(c => c.toObject());

    comments.sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return db - da;
    });

    res.json({
      success: true,
      comments,
      count: comments.length
    });
  } catch (error) {
    console.error('Error fetching pending comments:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب التعليقات المعلقة'
    });
  }
});

// Get reported comments
router.get('/reported', async (req, res) => {
  try {
    let reportedModels = await CommentLocal.find({ status: 'reported' });
    let comments = reportedModels.map(c => c.toObject());

    comments.sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return db - da;
    });

    res.json({
      success: true,
      comments,
      count: comments.length
    });
  } catch (error) {
    console.error('Error fetching reported comments:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب التعليقات المبلغ عنها'
    });
  }
});

// Get comments statistics
router.get('/stats', async (req, res) => {
  try {
    const total = await CommentLocal.countDocuments();
    const pending = await CommentLocal.countDocuments({ status: 'pending' });
    const approved = await CommentLocal.countDocuments({ status: 'approved' });
    const rejected = await CommentLocal.countDocuments({ status: 'rejected' });
    const reported = await CommentLocal.countDocuments({ status: 'reported' });
    const featured = await CommentLocal.countDocuments({ featured: true });

    res.json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        rejected,
        reported,
        featured
      }
    });
  } catch (error) {
    console.error('Error fetching comment stats:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإحصائيات'
    });
  }
});

// Approve comment
router.patch('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await CommentLocal.findByIdAndUpdate(
      id,
      { status: 'approved', updatedAt: new Date() },
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
      message: 'تم الموافقة على التعليق',
      comment
    });
  } catch (error) {
    console.error('Error approving comment:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الموافقة على التعليق'
    });
  }
});

// Reject comment
router.patch('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await CommentLocal.findByIdAndUpdate(
      id,
      { status: 'rejected', updatedAt: new Date() },
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
      message: 'تم رفض التعليق',
      comment
    });
  } catch (error) {
    console.error('Error rejecting comment:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في رفض التعليق'
    });
  }
});

// Toggle featured status
router.patch('/:id/featured', async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await CommentLocal.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'التعليق غير موجود'
      });
    }

    comment.featured = !comment.featured;
    comment.updatedAt = new Date();
    await comment.save();

    res.json({
      success: true,
      message: comment.featured ? 'تم تمييز التعليق' : 'تم إلغاء تمييز التعليق',
      comment
    });
  } catch (error) {
    console.error('Error toggling featured:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث حالة التمييز'
    });
  }
});

// Update comment
router.put('/:id/update', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date() };

    const comment = await CommentLocal.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'التعليق غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم تحديث التعليق بنجاح',
      comment
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث التعليق',
      error: error.message
    });
  }
});

// Delete comment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await CommentLocal.findByIdAndDelete(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'التعليق غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم حذف التعليق بنجاح'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف التعليق'
    });
  }
});

module.exports = router;
