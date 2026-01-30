// ==================== Get Statistics ====================

import { NextRequest, NextResponse } from 'next/server';
import { ReviewLocal } from '@/lib/models/ReviewLocal';
import { CommentLocal } from '@/lib/models/CommentLocal';
import { requireAuth } from '@/lib/middleware/auth';
import { ApiResponse } from '@/types';

interface Stats {
  // Reviews
  totalReviews: number;
  publishedReviews: number;
  draftReviews: number;
  archivedReviews: number;
  featuredReviews: number;
  
  // Comments
  totalComments: number;
  approvedComments: number;
  pendingComments: number;
  reportedComments: number;
  rejectedComments: number;
  
  // Engagement
  totalViews: number;
  totalLikes: number;
  averageRating: number;
  totalCommentLikes: number;
  
  // Top Reviews
  topViewedReviews: Array<{ title: string; views: number; slug: string }>;
  topLikedReviews: Array<{ title: string; likes: number; slug: string }>;
  topRatedReviews: Array<{ title: string; rating: number; slug: string }>;
  
  // Recent Activity
  reviewsLast7Days: number;
  reviewsLast30Days: number;
  commentsLast7Days: number;
  commentsLast30Days: number;
  
  // Status Breakdown
  reviewsByStatus: {
    published: number;
    draft: number;
    archived: number;
  };
  commentsByStatus: {
    approved: number;
    pending: number;
    reported: number;
    rejected: number;
  };
}

async function handler(req: NextRequest, admin: any) {
  try {
    const allReviews = await ReviewLocal.find({});
    const allComments = await CommentLocal.find({});

    const reviews = allReviews.map((r) => r.toObject());
    const comments = allComments.map((c) => c.toObject());

    // Calculate dates
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Reviews statistics
    const totalReviews = reviews.length;
    const publishedReviews = reviews.filter((r) => r.status === 'published').length;
    const draftReviews = reviews.filter((r) => r.status === 'draft').length;
    const archivedReviews = reviews.filter((r) => r.status === 'archived').length;
    const featuredReviews = reviews.filter((r) => r.featured).length;

    // Comments statistics
    const totalComments = comments.length;
    const approvedComments = comments.filter((c) => c.status === 'approved').length;
    const pendingComments = comments.filter((c) => c.status === 'pending').length;
    const reportedComments = comments.filter((c) => c.status === 'reported').length;
    const rejectedComments = comments.filter((c) => c.status === 'rejected').length;

    // Engagement statistics
    const totalViews = reviews.reduce((sum, r) => sum + (r.views || 0), 0);
    const totalLikes = reviews.reduce((sum, r) => sum + (r.likes || 0), 0);
    const totalCommentLikes = comments.reduce((sum, c) => sum + (c.likes || 0), 0);
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;

    // Top Reviews
    const topViewedReviews = reviews
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map((r) => ({
        title: r.title,
        views: r.views || 0,
        slug: r.slug || r.id || '',
      }));

    const topLikedReviews = reviews
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 5)
      .map((r) => ({
        title: r.title,
        likes: r.likes || 0,
        slug: r.slug || r.id || '',
      }));

    const topRatedReviews = reviews
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5)
      .map((r) => ({
        title: r.title,
        rating: r.rating || 0,
        slug: r.slug || r.id || '',
      }));

    // Recent Activity
    const reviewsLast7Days = reviews.filter(
      (r) => new Date(r.createdAt) >= last7Days
    ).length;
    const reviewsLast30Days = reviews.filter(
      (r) => new Date(r.createdAt) >= last30Days
    ).length;
    const commentsLast7Days = comments.filter(
      (c) => new Date(c.createdAt) >= last7Days
    ).length;
    const commentsLast30Days = comments.filter(
      (c) => new Date(c.createdAt) >= last30Days
    ).length;

    const stats: Stats = {
      totalReviews,
      publishedReviews,
      draftReviews,
      archivedReviews,
      featuredReviews,
      totalComments,
      approvedComments,
      pendingComments,
      reportedComments,
      rejectedComments,
      totalViews,
      totalLikes,
      averageRating: Math.round(averageRating * 10) / 10,
      totalCommentLikes,
      topViewedReviews,
      topLikedReviews,
      topRatedReviews,
      reviewsLast7Days,
      reviewsLast30Days,
      commentsLast7Days,
      commentsLast30Days,
      reviewsByStatus: {
        published: publishedReviews,
        draft: draftReviews,
        archived: archivedReviews,
      },
      commentsByStatus: {
        approved: approvedComments,
        pending: pendingComments,
        reported: reportedComments,
        rejected: rejectedComments,
      },
    };

    return NextResponse.json({
      success: true,
      data: stats,
    } as ApiResponse<Stats>);
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'خطأ في جلب الإحصائيات',
        error: error.message,
      } as ApiResponse,
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handler);
