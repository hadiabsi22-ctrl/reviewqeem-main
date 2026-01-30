'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Review } from '@/types';
import styles from './page.module.css';

export default function AdminReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/management-station/login');
      return;
    }

    fetch('/api/reviews/all', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // عرض جميع المراجعات بدون تصفية
          setReviews(data.reviews || data.data || []);
        } else {
          setError(data.message || 'فشل تحميل المراجعات');
        }
      })
      .catch((err) => {
        setError('حدث خطأ في الاتصال بالخادم');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleDelete = async (reviewId: string, reviewTitle: string) => {
    if (!confirm(`هل أنت متأكد من حذف المراجعة "${reviewTitle}"؟\n\nهذا الإجراء لا يمكن التراجع عنه.`)) {
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setReviews(reviews.filter(r => (r.id || r._id) !== reviewId));
      } else {
        alert(data.message || 'فشل حذف المراجعة');
      }
    } catch (err) {
      alert('حدث خطأ في الاتصال بالخادم');
      console.error(err);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = !searchQuery || 
      review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.summary && review.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const truncateTitle = (title: string, maxLength: number = 60) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Link href="/management-station" className={styles.backBtn}>
              <span className={styles.backIcon}>←</span>
              العودة
            </Link>
            <div>
              <h1>إدارة المراجعات</h1>
              <p className={styles.subtitle}>
                إجمالي المراجعات: <strong>{reviews.length}</strong>
              </p>
            </div>
          </div>
          <Link href="/management-station/reviews/new" className={styles.newBtn}>
            <span className={styles.plusIcon}>+</span>
            مراجعة جديدة
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        {error && (
          <div className={styles.error}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        {/* Search and Filters */}
        {reviews.length > 0 && (
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="بحث في المراجعات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filters}>
              <button
                className={`${styles.filterBtn} ${statusFilter === 'all' ? styles.active : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                الكل ({reviews.length})
              </button>
              <button
                className={`${styles.filterBtn} ${statusFilter === 'published' ? styles.active : ''}`}
                onClick={() => setStatusFilter('published')}
              >
                منشور ({reviews.filter(r => r.status === 'published').length})
              </button>
              <button
                className={`${styles.filterBtn} ${statusFilter === 'draft' ? styles.active : ''}`}
                onClick={() => setStatusFilter('draft')}
              >
                مسودة ({reviews.filter(r => r.status === 'draft').length})
              </button>
              <button
                className={`${styles.filterBtn} ${statusFilter === 'archived' ? styles.active : ''}`}
                onClick={() => setStatusFilter('archived')}
              >
                مؤرشف ({reviews.filter(r => r.status === 'archived').length})
              </button>
            </div>
          </div>
        )}

        {filteredReviews.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📝</div>
            <p>{searchQuery || statusFilter !== 'all' ? 'لا توجد نتائج للبحث' : 'لا توجد مراجعات'}</p>
            {!searchQuery && statusFilter === 'all' && (
              <Link href="/management-station/reviews/new" className={styles.newBtn}>
                <span className={styles.plusIcon}>+</span>
                إنشاء مراجعة جديدة
              </Link>
            )}
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <div className={styles.table}>
              <table className={styles.tableElement}>
                <thead>
                  <tr>
                    <th>العنوان</th>
                    <th>الحالة</th>
                    <th>التقييم</th>
                    <th>المشاهدات</th>
                    <th>الإعجابات</th>
                    <th>التاريخ</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map((review) => (
                    <tr key={review.id || review._id}>
                      <td className={styles.titleCell}>
                        <div className={styles.titleWrapper}>
                          <Link 
                            href={`/reviews/${review.slug || review.id || review._id}`}
                            target="_blank"
                            className={styles.titleLink}
                            title={review.title}
                          >
                            {truncateTitle(review.title)}
                          </Link>
                          {review.featured && (
                            <span className={styles.featuredBadge} title="مراجعة مميزة">
                              ⭐
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.status} ${styles[review.status]}`}>
                          {review.status === 'published' ? 'منشور' : 
                           review.status === 'draft' ? 'مسودة' : 'مؤرشف'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.rating}>
                          <span className={styles.ratingValue}>{review.rating.toFixed(1)}</span>
                          <span className={styles.ratingMax}>/10</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.views}>
                          <span className={styles.viewsIcon}>👁️</span>
                          {review.views || 0}
                        </div>
                      </td>
                      <td>
                        <div className={styles.likes}>
                          <span className={styles.likesIcon}>👍</span>
                          {review.likes || 0}
                        </div>
                      </td>
                      <td className={styles.dateCell}>
                        {new Date(review.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <Link 
                            href={`/management-station/reviews/${review.id || review._id}/edit`} 
                            className={styles.editBtn}
                            title="تعديل المراجعة"
                          >
                            <span className={styles.editIcon}>✏️</span>
                            تعديل
                          </Link>
                          <button
                            onClick={() => handleDelete(review.id || review._id || '', review.title)}
                            className={styles.deleteBtn}
                            title="حذف المراجعة"
                          >
                            <span className={styles.deleteIcon}>🗑️</span>
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
