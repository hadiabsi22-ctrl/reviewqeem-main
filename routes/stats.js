const express = require('express');
const ReviewLocal = require('../models/ReviewLocal');
const CommentLocal = require('../models/CommentLocal');
const GameLocal = require('../models/GameLocal');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

// Get all statistics
router.get('/', async (req, res) => {
  try {
    // Reviews statistics
    const totalReviews = await ReviewLocal.countDocuments();
    const publishedReviews = await ReviewLocal.countDocuments({ status: 'published' });
    const draftReviews = await ReviewLocal.countDocuments({ status: 'draft' });
    const archivedReviews = await ReviewLocal.countDocuments({ status: 'archived' });
    const featuredReviews = await ReviewLocal.countDocuments({ featured: true });

    // Average rating - simplified for local storage
    const publishedReviewsList = await ReviewLocal.find({ status: 'published' });
    const ratings = publishedReviewsList.map(r => r.data.rating || 0).filter(r => r > 0);
    const ratingStats = ratings.length > 0 ? [{
      _id: null,
      avgRating: ratings.reduce((a, b) => a + b, 0) / ratings.length,
      maxRating: Math.max(...ratings),
      minRating: Math.min(...ratings)
    }] : [{ _id: null, avgRating: 0, maxRating: 0, minRating: 0 }];

    // Total views - simplified for local storage
    const views = publishedReviewsList.map(r => r.data.views || 0);
    const viewsStats = [{
      _id: null,
      totalViews: views.reduce((a, b) => a + b, 0),
      avgViews: views.length > 0 ? views.reduce((a, b) => a + b, 0) / views.length : 0
    }];

    // Reviews by genre - simplified for local storage
    const genreCounts = {};
    publishedReviewsList.forEach(review => {
      const genre = review.data.genre;
      if (genre && genre.trim() !== '') {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      }
    });
    const reviewsByGenre = Object.entries(genreCounts)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Reviews by platform - simplified for local storage
    const platformCounts = {};
    publishedReviewsList.forEach(review => {
      const platforms = review.data.platforms || [];
      if (Array.isArray(platforms)) {
        platforms.forEach(platform => {
          const platformName = typeof platform === 'string' ? platform : (platform.name || platform);
          if (platformName) {
            platformCounts[platformName] = (platformCounts[platformName] || 0) + 1;
          }
        });
      }
    });
    const reviewsByPlatform = Object.entries(platformCounts)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count);

    // Comments statistics
    const totalComments = await CommentLocal.countDocuments();
    const pendingComments = await CommentLocal.countDocuments({ status: 'pending' });
    const approvedComments = await CommentLocal.countDocuments({ status: 'approved' });
    const reportedComments = await CommentLocal.countDocuments({ status: 'reported' });
    const featuredComments = await CommentLocal.countDocuments({ featured: true });

    // Games statistics
    const totalGames = await GameLocal.countDocuments();

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();
    const allReviews = await ReviewLocal.find();
    const recentReviews = allReviews.filter(r => {
      const createdAt = r.data.createdAt;
      return createdAt && new Date(createdAt) >= new Date(thirtyDaysAgoISO);
    }).length;

    const allComments = await CommentLocal.find();
    const recentComments = allComments.filter(c => {
      const createdAt = c.data.createdAt;
      return createdAt && new Date(createdAt) >= new Date(thirtyDaysAgoISO);
    }).length;

    // Top reviewed games - simplified for local storage
    const gameStats = {};
    publishedReviewsList.forEach(review => {
      const gameName = review.data.gameName;
      if (gameName) {
        if (!gameStats[gameName]) {
          gameStats[gameName] = { count: 0, totalRating: 0 };
        }
        gameStats[gameName].count += 1;
        gameStats[gameName].totalRating += (review.data.rating || 0);
      }
    });
    const topReviewedGames = Object.entries(gameStats)
      .map(([_id, stats]) => ({
        _id,
        count: stats.count,
        avgRating: stats.totalRating / stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({
      success: true,
      stats: {
        reviews: {
          total: totalReviews,
          published: publishedReviews,
          draft: draftReviews,
          archived: archivedReviews,
          featured: featuredReviews,
          recent: recentReviews,
          rating: ratingStats[0] || { avgRating: 0, maxRating: 0, minRating: 0 },
          views: viewsStats[0] || { totalViews: 0, avgViews: 0 },
          byGenre: reviewsByGenre,
          byPlatform: reviewsByPlatform,
          topGames: topReviewedGames
        },
        comments: {
          total: totalComments,
          pending: pendingComments,
          approved: approvedComments,
          reported: reportedComments,
          featured: featuredComments,
          recent: recentComments
        },
        games: {
          total: totalGames
        }
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإحصائيات',
      error: error.message
    });
  }
});

// Get reviews statistics only
router.get('/reviews', authenticate, isAdmin, async (req, res) => {
  try {
    const total = await ReviewLocal.countDocuments();
    const published = await ReviewLocal.countDocuments({ status: 'published' });
    const draft = await ReviewLocal.countDocuments({ status: 'draft' });
    const archived = await ReviewLocal.countDocuments({ status: 'archived' });

    res.json({
      success: true,
      stats: {
        total,
        published,
        draft,
        archived
      }
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات المراجعات'
    });
  }
});

// Get comments statistics only
router.get('/comments', authenticate, isAdmin, async (req, res) => {
  try {
    const total = await CommentLocal.countDocuments();
    const pending = await CommentLocal.countDocuments({ status: 'pending' });
    const approved = await CommentLocal.countDocuments({ status: 'approved' });
    const reported = await CommentLocal.countDocuments({ status: 'reported' });

    res.json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        reported
      }
    });
  } catch (error) {
    console.error('Error fetching comment stats:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات التعليقات'
    });
  }
});

module.exports = router;
