'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

interface Stats {
  totalReviews: number;
  publishedReviews: number;
  draftReviews: number;
  archivedReviews: number;
  featuredReviews: number;
  totalComments: number;
  approvedComments: number;
  pendingComments: number;
  reportedComments: number;
  rejectedComments: number;
  totalViews: number;
  totalLikes: number;
  averageRating: number;
  totalCommentLikes: number;
  topViewedReviews: Array<{ title: string; views: number; slug: string }>;
  topLikedReviews: Array<{ title: string; likes: number; slug: string }>;
  topRatedReviews: Array<{ title: string; rating: number; slug: string }>;
  reviewsLast7Days: number;
  reviewsLast30Days: number;
  commentsLast7Days: number;
  commentsLast30Days: number;
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

export default function AdminStatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    fetch('/api/stats', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data || data);
        }
      })
      .catch((err) => {
        console.error('Error loading stats:', err);
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>جاري التحميل...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>لا توجد إحصائيات متاحة</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/admin" className={styles.backBtn}>
            ← العودة
          </Link>
          <h1>الإحصائيات</h1>
        </div>
      </header>

      <main className={styles.main}>
        {/* Overview Cards */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>نظرة عامة</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>📝</div>
              <h3>إجمالي المراجعات</h3>
              <p className={styles.number}>{stats.totalReviews}</p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon}>✅</div>
              <h3>المراجعات المنشورة</h3>
              <p className={styles.number}>{stats.publishedReviews}</p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon}>💬</div>
              <h3>إجمالي التعليقات</h3>
              <p className={styles.number}>{stats.totalComments}</p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon}>👁️</div>
              <h3>إجمالي المشاهدات</h3>
              <p className={styles.number}>{stats.totalViews.toLocaleString()}</p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon}>👍</div>
              <h3>إجمالي الإعجابات</h3>
              <p className={styles.number}>{stats.totalLikes.toLocaleString()}</p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon}>⭐</div>
              <h3>متوسط التقييم</h3>
              <p className={styles.number}>{stats.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>

        {/* Reviews Breakdown */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>تفاصيل المراجعات</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <h3>منشورة</h3>
              <p className={styles.number}>{stats.publishedReviews}</p>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ 
                    width: `${stats.totalReviews > 0 ? (stats.publishedReviews / stats.totalReviews) * 100 : 0}%`,
                    background: 'var(--success)'
                  }}
                />
              </div>
            </div>

            <div className={styles.card}>
              <h3>مسودة</h3>
              <p className={styles.number}>{stats.draftReviews}</p>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ 
                    width: `${stats.totalReviews > 0 ? (stats.draftReviews / stats.totalReviews) * 100 : 0}%`,
                    background: 'var(--warning)'
                  }}
                />
              </div>
            </div>

            <div className={styles.card}>
              <h3>مؤرشفة</h3>
              <p className={styles.number}>{stats.archivedReviews}</p>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ 
                    width: `${stats.totalReviews > 0 ? (stats.archivedReviews / stats.totalReviews) * 100 : 0}%`,
                    background: 'var(--text-secondary)'
                  }}
                />
              </div>
            </div>

            <div className={styles.card}>
              <h3>مميزة</h3>
              <p className={styles.number}>{stats.featuredReviews}</p>
            </div>
          </div>
        </div>

        {/* Comments Breakdown */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>تفاصيل التعليقات</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <h3>موافق عليها</h3>
              <p className={styles.number}>{stats.approvedComments}</p>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ 
                    width: `${stats.totalComments > 0 ? (stats.approvedComments / stats.totalComments) * 100 : 0}%`,
                    background: 'var(--success)'
                  }}
                />
              </div>
            </div>

            <div className={styles.card}>
              <h3>في الانتظار</h3>
              <p className={styles.number}>{stats.pendingComments}</p>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ 
                    width: `${stats.totalComments > 0 ? (stats.pendingComments / stats.totalComments) * 100 : 0}%`,
                    background: 'var(--warning)'
                  }}
                />
              </div>
            </div>

            <div className={styles.card}>
              <h3>مبلغ عنها</h3>
              <p className={styles.number}>{stats.reportedComments}</p>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ 
                    width: `${stats.totalComments > 0 ? (stats.reportedComments / stats.totalComments) * 100 : 0}%`,
                    background: 'var(--danger)'
                  }}
                />
              </div>
            </div>

            <div className={styles.card}>
              <h3>إعجابات التعليقات</h3>
              <p className={styles.number}>{stats.totalCommentLikes}</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>النشاط الأخير</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <h3>مراجعات (آخر 7 أيام)</h3>
              <p className={styles.number}>{stats.reviewsLast7Days}</p>
            </div>

            <div className={styles.card}>
              <h3>مراجعات (آخر 30 يوم)</h3>
              <p className={styles.number}>{stats.reviewsLast30Days}</p>
            </div>

            <div className={styles.card}>
              <h3>تعليقات (آخر 7 أيام)</h3>
              <p className={styles.number}>{stats.commentsLast7Days}</p>
            </div>

            <div className={styles.card}>
              <h3>تعليقات (آخر 30 يوم)</h3>
              <p className={styles.number}>{stats.commentsLast30Days}</p>
            </div>
          </div>
        </div>

        {/* Top Reviews */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>أفضل المراجعات</h2>
          <div className={styles.topReviewsGrid}>
            <div className={styles.topList}>
              <h3>الأكثر مشاهدة</h3>
              <ul>
                {stats.topViewedReviews.length > 0 ? (
                  stats.topViewedReviews.map((review, index) => (
                    <li key={index}>
                      <Link href={`/reviews/${review.slug}`} target="_blank">
                        <span className={styles.rank}>#{index + 1}</span>
                        <span className={styles.title}>{review.title}</span>
                        <span className={styles.count}>{review.views.toLocaleString()} مشاهدة</span>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className={styles.empty}>لا توجد مراجعات</li>
                )}
              </ul>
            </div>

            <div className={styles.topList}>
              <h3>الأكثر إعجاباً</h3>
              <ul>
                {stats.topLikedReviews.length > 0 ? (
                  stats.topLikedReviews.map((review, index) => (
                    <li key={index}>
                      <Link href={`/reviews/${review.slug}`} target="_blank">
                        <span className={styles.rank}>#{index + 1}</span>
                        <span className={styles.title}>{review.title}</span>
                        <span className={styles.count}>{review.likes.toLocaleString()} إعجاب</span>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className={styles.empty}>لا توجد مراجعات</li>
                )}
              </ul>
            </div>

            <div className={styles.topList}>
              <h3>الأعلى تقييماً</h3>
              <ul>
                {stats.topRatedReviews.length > 0 ? (
                  stats.topRatedReviews.map((review, index) => (
                    <li key={index}>
                      <Link href={`/reviews/${review.slug}`} target="_blank">
                        <span className={styles.rank}>#{index + 1}</span>
                        <span className={styles.title}>{review.title}</span>
                        <span className={styles.count}>⭐ {review.rating}/10</span>
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className={styles.empty}>لا توجد مراجعات</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
