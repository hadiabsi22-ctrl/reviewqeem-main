'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Review } from '@/types';
import styles from './ReviewCard.module.css';

interface ReviewCardProps {
  review: Review;
}

// دالة لإصلاح مسار الصورة
function fixImagePath(imagePath: string | undefined): string {
  if (!imagePath) {
    return '/images/placeholder.jpg';
  }

  // إذا كان المسار يبدأ بـ http، اتركه كما هو
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // تنظيف المسار
  let cleanPath = imagePath.trim();

  // إذا كان المسار يبدأ بـ uploads/covers/ أو uploads/
  if (cleanPath.startsWith('uploads/covers/')) {
    return `/api/uploads/covers/${cleanPath.replace('uploads/covers/', '')}`;
  }
  if (cleanPath.startsWith('uploads/')) {
    return `/api/uploads/${cleanPath.replace('uploads/', '')}`;
  }

  // إذا كان المسار يبدأ بـ /uploads/covers/ أو /uploads/
  if (cleanPath.startsWith('/uploads/covers/')) {
    return `/api/uploads/covers/${cleanPath.replace('/uploads/covers/', '')}`;
  }
  if (cleanPath.startsWith('/uploads/')) {
    return `/api/uploads/${cleanPath.replace('/uploads/', '')}`;
  }

  // إذا كان المسار فقط اسم الملف (بدون مسار)
  if (!cleanPath.includes('/') && !cleanPath.startsWith('/')) {
    return `/api/uploads/covers/${cleanPath}`;
  }

  // إذا كان المسار يبدأ بـ /api/، اتركه كما هو
  if (cleanPath.startsWith('/api/')) {
    return cleanPath;
  }

  // إذا كان المسار يبدأ بـ /، استخدمه مباشرة (للملفات في public)
  if (cleanPath.startsWith('/')) {
    return cleanPath;
  }

  // افتراضياً، استخدم API route
  return `/api/uploads/covers/${cleanPath}`;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  // إصلاح مسار الصورة
  const coverImage = fixImagePath(review.coverImage);
  
  const summary = review.summary || '';
  const cleanSummary = summary.length > 150 ? summary.substring(0, 150) + '...' : summary;
  
  // إصلاح مسار المراجعة - استخدام ID مباشرة (الأكثر موثوقية)
  const reviewId = review.id || review._id || '';
  
  // بناء URL - استخدم ID مباشرة إذا كان موجوداً، وإلا استخدم slug
  let reviewUrl = '';
  if (reviewId) {
    // استخدم ID مباشرة - هذا الأكثر موثوقية
    reviewUrl = `/reviews/${reviewId}`;
  } else if (review.slug) {
    // إذا لم يكن ID موجود، استخدم slug
    let reviewSlug = review.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0600-\u06FF-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    reviewUrl = `/reviews/${reviewSlug}`;
  } else {
    // إذا لم يكن أي منهما موجود، استخدم title
    let reviewSlug = review.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    reviewUrl = `/reviews/${reviewSlug}`;
  }

  return (
    <Link href={reviewUrl} className={styles.card}>
      <div className={styles.imageContainer}>
        <Image
          src={coverImage}
          alt={review.title}
          width={280}
          height={196}
          className={styles.image}
          loading="lazy"
          unoptimized={true}
          onError={(e) => {
            // إذا فشل تحميل الصورة، استخدم placeholder
            console.log('❌ فشل تحميل الصورة:', coverImage);
            (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
          }}
          onLoad={() => {
            console.log('✅ تم تحميل الصورة بنجاح:', coverImage);
          }}
        />
        <div className={styles.rating}>
          <span className={styles.ratingValue}>{review.rating.toFixed(1)}</span>
          <span className={styles.ratingMax}>/10</span>
        </div>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{review.title}</h3>
        {cleanSummary && (
          <p className={styles.excerpt}>{cleanSummary}</p>
        )}
        <div className={styles.meta}>
          <span className={styles.views}>
            👁️ {review.views || 0}
          </span>
          <span className={styles.date}>
            {new Date(review.createdAt).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        </div>
        <span className={styles.readMore}>اقرأ المزيد →</span>
      </div>
    </Link>
  );
}
