'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Review } from '@/types';
import styles from './page.module.css';

export default function AdminTheoriesPage() {
  const router = useRouter();
  const [theories, setTheories] = useState<Review[]>([]);
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
          // قسم النظريات فارغ - لا توجد نظريات بعد
          // سيتم إضافة النظريات لاحقاً من صفحة "إنشاء نظرية جديدة"
          setTheories([]);
        } else {
          setError(data.message || 'فشل تحميل النظريات');
        }
      })
      .catch((err) => {
        setError('حدث خطأ في الاتصال بالخادم');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleDelete = async (theoryId: string, theoryTitle: string) => {
    if (!confirm(`هل أنت متأكد من حذف النظرية "${theoryTitle}"؟\n\nهذا الإجراء لا يمكن التراجع عنه.`)) {
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const response = await fetch(`/api/reviews/${theoryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setTheories(theories.filter((t) => (t.id || t._id) !== theoryId));
      } else {
        alert(data.message || 'فشل حذف النظرية');
      }
    } catch (err) {
      alert('حدث خطأ في الاتصال بالخادم');
      console.error(err);
    }
  };

  const filteredTheories = theories.filter((theory) => {
    const matchesSearch =
      theory.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theory.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || theory.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: theories.length,
    published: theories.filter((t) => t.status === 'published').length,
    draft: theories.filter((t) => t.status === 'draft').length,
    archived: theories.filter((t) => t.status === 'archived').length,
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <Link href="/management-station" className={styles.backBtn}>
              ← العودة
            </Link>
            <div>
              <h1 className={styles.title}>إدارة النظريات</h1>
              <p className={styles.subtitle}>
                إجمالي النظريات: <span className={styles.count}>{theories.length}</span>
              </p>
            </div>
          </div>
          <Link href="/management-station/theories/new" className={styles.newBtn}>
            + نظرية جديدة
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="بحث في النظريات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.statusFilters}>
            <button
              className={`${styles.filterBtn} ${statusFilter === 'all' ? styles.active : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              الكل ({statusCounts.all})
            </button>
            <button
              className={`${styles.filterBtn} ${statusFilter === 'published' ? styles.active : ''}`}
              onClick={() => setStatusFilter('published')}
            >
              منشور ({statusCounts.published})
            </button>
            <button
              className={`${styles.filterBtn} ${statusFilter === 'draft' ? styles.active : ''}`}
              onClick={() => setStatusFilter('draft')}
            >
              مسودة ({statusCounts.draft})
            </button>
            <button
              className={`${styles.filterBtn} ${statusFilter === 'archived' ? styles.active : ''}`}
              onClick={() => setStatusFilter('archived')}
            >
              مؤرشف ({statusCounts.archived})
            </button>
          </div>
        </div>

        {filteredTheories.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                  <tr>
                    <th>العنوان</th>
                    <th>الحالة</th>
                    <th>المشاهدات</th>
                    <th>التاريخ</th>
                    <th>الإجراءات</th>
                  </tr>
              </thead>
              <tbody>
                {filteredTheories.map((theory) => (
                  <tr key={theory.id || theory._id}>
                    <td>
                      <div className={styles.titleCell}>
                        <Link
                          href={`/reviews/${theory.slug || theory.id || theory._id}`}
                          target="_blank"
                          className={styles.titleLink}
                        >
                          {theory.title}
                        </Link>
                        {theory.featured && (
                          <span className={styles.featuredBadge}>⭐ مميزة</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          theory.status === 'published'
                            ? styles.published
                            : theory.status === 'draft'
                            ? styles.draft
                            : styles.archived
                        }`}
                      >
                        {theory.status === 'published'
                          ? 'منشور'
                          : theory.status === 'draft'
                          ? 'مسودة'
                          : 'مؤرشف'}
                      </span>
                    </td>
                    <td>
                      <span className={styles.views}>
                        👁️ {theory.views || 0}
                      </span>
                    </td>
                    <td>
                      {theory.createdAt
                        ? new Date(theory.createdAt).toLocaleDateString('ar-SA')
                        : '-'}
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <Link
                          href={`/management-station/theories/${theory.id || theory._id}/edit`}
                          className={styles.editBtn}
                        >
                          ✏️ تعديل
                        </Link>
                        <button
                          onClick={() => handleDelete(theory.id || theory._id || '', theory.title || '')}
                          className={styles.deleteBtn}
                        >
                          🗑️ حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📚</div>
            <p>لا توجد نظريات متاحة</p>
            <Link href="/management-station/theories/new" className={styles.newBtn}>
              + إنشاء نظرية جديدة
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
