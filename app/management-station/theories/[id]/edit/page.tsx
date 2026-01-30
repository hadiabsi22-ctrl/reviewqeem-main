'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Review } from '@/types';
import TipTapEditor from '@/components/TipTapEditor';
import styles from './page.module.css';

export default function EditTheoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    genre: [] as string[],
    status: 'draft' as 'draft' | 'published' | 'archived',
    featured: false,
    coverImage: '',
  });

  const genres = ['Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Racing', 'Fighting', 'Puzzle', 'Horror', 'Simulation'];

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/management-station/login');
      return;
    }

    // Load theory data
    fetch(`/api/reviews/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.review) {
          const theory = data.review;
          setFormData({
            title: theory.title || '',
            slug: theory.slug || '',
            summary: theory.summary || '',
            content: theory.content || '',
            genre: theory.tags || [],
            status: theory.status || 'draft',
            featured: theory.featured || false,
            coverImage: theory.coverImage || '',
          });
        } else {
          setError(data.message || 'فشل تحميل النظرية');
        }
      })
      .catch((err) => {
        setError('حدث خطأ في الاتصال بالخادم');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleGenreToggle = (genre: string) => {
    setFormData({
      ...formData,
      genre: formData.genre.includes(genre)
        ? formData.genre.filter(g => g !== genre)
        : [...formData.genre, genre],
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/management-station/login');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const response = await fetch('/api/upload/single', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      const data = await response.json();
      if (data.success && data.url) {
        setFormData({ ...formData, coverImage: data.url });
      } else {
        setError(data.message || 'فشل رفع الصورة');
      }
    } catch (err) {
      setError('حدث خطأ في رفع الصورة');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/management-station/login');
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          pros: [],
          cons: [],
        }),
      });

      const data = await response.json();
      if (data.success) {
        router.push('/management-station/theories');
      } else {
        setError(data.message || 'فشل تحديث النظرية');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذه النظرية؟')) return;

    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/management-station/login');
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        router.push('/management-station/theories');
      } else {
        setError(data.message || 'فشل حذف النظرية');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
      console.error(err);
    }
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
          <Link href="/management-station/theories" className={styles.backBtn}>
            ← العودة
          </Link>
          <h1>تعديل النظرية</h1>
        </div>
      </header>

      <main className={styles.main}>
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.section}>
            <h2>المعلومات الأساسية</h2>
            
            <div className={styles.field}>
              <label>العنوان *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className={styles.field}>
              <label>الرابط (Slug) *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>

            <div className={styles.field}>
              <label>الملخص *</label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className={styles.field}>
              <label>المحتوى *</label>
              <TipTapEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="ابدأ بكتابة محتوى النظرية... يمكنك إضافة صور، عناوين، وتنسيقات مختلفة"
              />
            </div>
          </div>

          <div className={styles.section}>
            <h2>النوع</h2>
            
            <div className={styles.field}>
              <label>النوع</label>
              <div className={styles.checkboxGroup}>
                {genres.map((genre) => (
                  <label key={genre} className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={formData.genre.includes(genre)}
                      onChange={() => handleGenreToggle(genre)}
                    />
                    <span>{genre}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>صورة الغلاف</h2>
            
            <div className={styles.field}>
              <label>صورة الغلاف *</label>
              {formData.coverImage ? (
                <div className={styles.imagePreview}>
                  <img src={formData.coverImage} alt="Cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, coverImage: '' })}
                    className={styles.removeBtn}
                  >
                    حذف
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              )}
              <p className={styles.helpText}>ملاحظة: يمكنك إضافة الصور في محرر المحتوى مباشرة</p>
            </div>
          </div>

          <div className={styles.section}>
            <h2>الإعدادات</h2>
            
            <div className={styles.field}>
              <label>الحالة</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="draft">مسودة</option>
                <option value="published">منشور</option>
                <option value="archived">مؤرشف</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                />
                <span>نظرية مميزة</span>
              </label>
            </div>
          </div>

          <div className={styles.actions}>
            <button type="submit" disabled={saving} className={styles.submitBtn}>
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className={styles.deleteBtn}
            >
              حذف النظرية
            </button>
            <Link href="/management-station/theories" className={styles.cancelBtn}>
              إلغاء
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
