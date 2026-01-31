'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TipTapEditor from '@/components/TipTapEditor';
import styles from './page.module.css';

export default function NewTheoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

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
      // رفع صورة الغلاف في مجلد covers
      const response = await fetch('/api/upload/single?folder=covers', {
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
    setLoading(true);
    setError('');

    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/management-station/login');
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
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
        setSuccess(true);
        // إظهار رسالة النجاح ثم إعادة التوجيه بعد ثانيتين
        setTimeout(() => {
          router.push('/management-station/theories');
        }, 2000);
      } else {
        setError(data.message || 'فشل إنشاء النظرية');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/management-station/theories" className={styles.backBtn}>
            ← العودة
          </Link>
          <h1>نظرية جديدة</h1>
        </div>
      </header>

      <main className={styles.main}>
        {error && <div className={styles.error}>{error}</div>}
        {success && (
          <div className={styles.success}>
            ✅ تم النشر بنجاح! جاري إعادة التوجيه...
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.section}>
            <h2>المعلومات الأساسية</h2>
            
            <div className={styles.field}>
              <label>العنوان *</label>
              <input
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                required
                placeholder="عنوان النظرية"
              />
            </div>

            <div className={styles.field}>
              <label>الرابط (Slug) *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                placeholder="theory-slug"
              />
            </div>

            <div className={styles.field}>
              <label>الملخص *</label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                required
                rows={3}
                placeholder="ملخص قصير عن النظرية"
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
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'جاري الحفظ...' : 'حفظ النظرية'}
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
