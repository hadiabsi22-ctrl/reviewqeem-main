'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Review, Comment } from '@/types';
import CommentForm from '@/components/CommentForm';
import CommentList from '@/components/CommentList';
import styles from './ReviewViewClient.module.css';

interface ReviewViewClientProps {
  review: Review;
  initialComments: Comment[];
}

// دالة لإصلاح مسار الصورة - تعمل مع جميع أنواع المسارات
function fixImagePath(imagePath: string | undefined): string {
  if (!imagePath) {
    return '/images/placeholder.jpg';
  }

  // إذا كان المسار يبدأ بـ http/https، اتركه كما هو (روابط خارجية)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // إذا كان الرابط يحتوي على localhost أو 127.0.0.1 (أي منفذ)، استخرج المسار النسبي
    if (imagePath.includes('localhost') || imagePath.includes('127.0.0.1')) {
      try {
        const url = new URL(imagePath);
        const relativePath = url.pathname;
        // تحويل المسار إلى /api/uploads/...
        if (relativePath.startsWith('/uploads/')) {
          return `/api${relativePath}`;
        }
        // إذا كان المسار يبدأ بـ /، استخدمه مباشرة
        if (relativePath.startsWith('/')) {
          return relativePath;
        }
        return `/${relativePath}`;
      } catch {
        // إذا فشل parsing، استخدم regex
        const match = imagePath.match(/(?:localhost|127\.0\.0\.1)(?::\d+)?\/(.+)/);
        if (match && match[1]) {
          const path = match[1];
          if (path.startsWith('uploads/')) {
            return `/api/${path}`;
          }
          return `/${path}`;
        }
      }
    }
    return imagePath;
  }

  // تنظيف المسار
  let cleanPath = imagePath.trim();

  // إزالة المسار الكامل إذا كان يحتوي على localhost أو 127.0.0.1
  if (cleanPath.includes('localhost') || cleanPath.includes('127.0.0.1')) {
    // استخراج المسار النسبي فقط
    const match = cleanPath.match(/(?:localhost|127\.0\.0\.1)(?::\d+)?\/(.+)/);
    if (match && match[1]) {
      cleanPath = match[1];
    }
  }

  // إذا كان المسار يبدأ بـ uploads/covers/ أو uploads/
  if (cleanPath.startsWith('uploads/covers/')) {
    const fileName = cleanPath.replace('uploads/covers/', '');
    return `/api/uploads/covers/${fileName}`;
  }
  if (cleanPath.startsWith('uploads/')) {
    const fileName = cleanPath.replace('uploads/', '');
    return `/api/uploads/${fileName}`;
  }

  // إذا كان المسار يبدأ بـ /uploads/covers/ أو /uploads/
  if (cleanPath.startsWith('/uploads/covers/')) {
    const fileName = cleanPath.replace('/uploads/covers/', '');
    return `/api/uploads/covers/${fileName}`;
  }
  if (cleanPath.startsWith('/uploads/')) {
    const fileName = cleanPath.replace('/uploads/', '');
    return `/api/uploads/${fileName}`;
  }

  // إذا كان المسار فقط اسم الملف (بدون مسار)
  if (!cleanPath.includes('/') && !cleanPath.startsWith('/')) {
    return `/api/uploads/covers/${cleanPath}`;
  }

  // إذا كان المسار يبدأ بـ /api/، اتركه كما هو
  if (cleanPath.startsWith('/api/')) {
    return cleanPath;
  }

  // إذا كان المسار يبدأ بـ /images/ أو /public/، اتركه كما هو (ملفات في public)
  if (cleanPath.startsWith('/images/') || cleanPath.startsWith('/public/')) {
    return cleanPath;
  }

  // إذا كان المسار يبدأ بـ /، استخدمه مباشرة
  if (cleanPath.startsWith('/')) {
    return cleanPath;
  }

  // افتراضياً، استخدم API route
  return `/api/uploads/covers/${cleanPath}`;
}

// دالة لمعالجة HTML وإصلاح مسارات الصور داخله - محسّنة
function fixContentImages(html: string): string {
  if (!html) return html;

  // استخدام regex لإيجاد جميع صور img في HTML (مع دعم جميع أنواع الاقتباسات)
  // يدعم: src="...", src='...', src=...
  const imgRegex = /<img([^>]*?)src\s*=\s*["']?([^"'\s>]+)["']?([^>]*?)>/gi;
  
  let processedHtml = html.replace(imgRegex, (match, before, src, after) => {
    // تنظيف src من أي مسافات أو اقتباسات إضافية
    const cleanSrc = src.trim().replace(/^["']|["']$/g, '');
    
    // إصلاح مسار الصورة
    const fixedSrc = fixImagePath(cleanSrc);
    
    // إضافة onerror handler للصور (كـ inline attribute)
    const onErrorHandler = ` onerror="this.onerror=null; this.src='/images/placeholder.jpg';"`;
    
    // إزالة أي onerror موجود مسبقاً لتجنب التكرار
    const cleanedBefore = before.replace(/\s*onerror\s*=\s*["'][^"']*["']/gi, '');
    const cleanedAfter = after.replace(/\s*onerror\s*=\s*["'][^"']*["']/gi, '');
    
    // إرجاع img tag مع المسار المصحح
    return `<img${cleanedBefore} src="${fixedSrc}"${onErrorHandler}${cleanedAfter}>`;
  });

  // أيضاً معالجة background-image في style attributes
  const bgImageRegex = /background-image:\s*url\(["']?([^"')]+)["']?\)/gi;
  processedHtml = processedHtml.replace(bgImageRegex, (match, url) => {
    const fixedUrl = fixImagePath(url.trim());
    return `background-image: url("${fixedUrl}")`;
  });

  // معالجة روابط localhost أو 127.0.0.1 مباشرة في النص
  const localhostRegex = /(?:http:\/\/)?(?:localhost|127\.0\.0\.1)(?::\d+)?\/uploads\/([^"'\s<>]+)/gi;
  processedHtml = processedHtml.replace(localhostRegex, (match, filePath) => {
    // إذا كان الملف في covers/، استخدم المسار الصحيح
    if (filePath.startsWith('covers/')) {
      return `/api/uploads/${filePath}`;
    }
    return `/api/uploads/${filePath}`;
  });

  // معالجة روابط localhost في src attributes مباشرة (جميع المنافذ)
  const localhostSrcRegex = /src=["'](?:http:\/\/)?(?:localhost|127\.0\.0\.1)(?::\d+)?\/uploads\/([^"']+)["']/gi;
  processedHtml = processedHtml.replace(localhostSrcRegex, (match, filePath) => {
    // استخدام fixImagePath لإصلاح المسار
    const fixedPath = fixImagePath(`/uploads/${filePath}`);
    return `src="${fixedPath}"`;
  });

  // معالجة روابط localhost في href attributes
  const localhostHrefRegex = /href=["'](?:http:\/\/)?(?:localhost|127\.0\.0\.1)(?::\d+)?\/([^"']+)["']/gi;
  processedHtml = processedHtml.replace(localhostHrefRegex, (match, path) => {
    return `href="/${path}"`;
  });

  return processedHtml;
}

export default function ReviewViewClient({ review, initialComments }: ReviewViewClientProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // إصلاح مسار الصورة الرئيسية
  const coverImage = fixImagePath(review.coverImage);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCommentAdded = (newComment: Comment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  // التأكد من وجود المحتوى ومعالجة الصور داخله
  const hasContent = review.content && review.content.trim().length > 0;
  let contentHtml = review.content || '<p>لا يوجد محتوى متاح لهذه المراجعة.</p>';
  
  // معالجة الصور في المحتوى (عند تحميل المكون)
  contentHtml = fixContentImages(contentHtml);

  // معالجة الصور بعد تحميل الصفحة (للمصورات التي يتم إضافتها ديناميكياً)
  useEffect(() => {
    const processImages = () => {
      const images = document.querySelectorAll('.content img');
      images.forEach((img) => {
        const imgElement = img as HTMLImageElement;
        const currentSrc = imgElement.src;
        
        // الحصول على المسار النسبي فقط (بدون domain)
        let relativePath = '';
        try {
          const url = new URL(currentSrc);
          relativePath = url.pathname;
        } catch {
          // إذا كان المسار نسبي بالفعل
          relativePath = currentSrc;
        }
        
        // إذا كانت الصورة من uploads ولم يتم إصلاحها بعد
        if (relativePath.includes('uploads/') && !relativePath.includes('/api/uploads/')) {
          const fixedPath = fixImagePath(relativePath);
          if (fixedPath !== relativePath) {
            imgElement.src = fixedPath;
            console.log('✅ تم إصلاح مسار الصورة:', relativePath, '→', fixedPath);
          }
        }
        
        // إضافة onerror handler إذا لم يكن موجوداً
        if (!imgElement.onerror) {
          imgElement.onerror = function() {
            console.log('❌ فشل تحميل الصورة:', this.src);
            this.onerror = null;
            this.src = '/images/placeholder.jpg';
          };
        }
      });
    };

    // معالجة الصور بعد تحميل الصفحة
    setTimeout(processImages, 100);
    
    // معالجة الصور بعد تغيير المحتوى
    const observer = new MutationObserver(() => {
      setTimeout(processImages, 100);
    });
    
    const contentElement = document.querySelector(`.${styles.content}`);
    if (contentElement) {
      observer.observe(contentElement, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['src']
      });
    }

    return () => observer.disconnect();
  }, [contentHtml]);

  return (
    <>
      <article className={styles.article}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/" className={styles.breadcrumbLink}>
            <span className={styles.breadcrumbIcon}>🏠</span>
            الرئيسية
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link href="/reviews" className={styles.breadcrumbLink}>
            المراجعات
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{review.title}</span>
        </nav>

        {/* Cover Image with Overlay */}
        <div className={styles.coverContainer}>
          <div className={styles.coverImageWrapper}>
            <Image
              src={coverImage}
              alt={review.title}
              width={1400}
              height={600}
              className={styles.coverImage}
              priority
              unoptimized={true}
              onError={(e) => {
                console.log('❌ فشل تحميل الصورة الرئيسية:', coverImage);
                (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
              }}
              onLoad={() => {
                console.log('✅ تم تحميل الصورة الرئيسية بنجاح:', coverImage);
              }}
            />
            <div className={styles.coverOverlay}></div>
          </div>
          
          {/* Rating Badge */}
          <div className={styles.ratingBadge}>
            <div className={styles.ratingCircle}>
              <span className={styles.ratingValue}>{review.rating.toFixed(1)}</span>
            </div>
            <span className={styles.ratingLabel}>/ 10</span>
          </div>

          {/* Title on Cover */}
          <div className={styles.coverTitle}>
            <h1 className={styles.title}>{review.title}</h1>
            <div className={styles.coverMeta}>
              <span className={styles.date}>
                📅 {new Date(review.createdAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className={styles.views}>
                👁️ {review.views || 0} مشاهدة
              </span>
              <span className={styles.likes}>
                👍 {review.likes || 0} إعجاب
              </span>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        {review.summary && (
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>📋</div>
            <div className={styles.summaryContent}>
              <h2 className={styles.summaryTitle}>ملخص المراجعة</h2>
              <p className={styles.summaryText}>{review.summary}</p>
            </div>
          </div>
        )}

        {/* Main Content - المحتوى الكامل */}
        <div className={styles.contentWrapper}>
          <div className={styles.contentHeader}>
            <h2 className={styles.contentTitle}>المحتوى الكامل</h2>
          </div>
          <div
            className="prose prose-invert lg:prose-xl max-w-none dark:prose-invert prose-headings:font-bold prose-p:text-justify prose-img:rounded-lg prose-img:shadow-lg prose-a:text-primary prose-strong:text-primary prose-headings:text-primary"
            style={{ color: 'var(--text-primary)' }}
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
          {!hasContent && (
            <div className={styles.noContent}>
              <p>⚠️ لا يوجد محتوى متاح لهذه المراجعة حالياً.</p>
            </div>
          )}
        </div>

        {/* Pros and Cons */}
        {(review.pros && review.pros.length > 0) || (review.cons && review.cons.length > 0) ? (
          <div className={styles.prosConsContainer}>
            {review.pros && review.pros.length > 0 && (
              <div className={styles.prosCard}>
                <div className={styles.prosHeader}>
                  <span className={styles.prosIcon}>✅</span>
                  <h3 className={styles.prosTitle}>الإيجابيات</h3>
                </div>
                <ul className={styles.prosList}>
                  {review.pros.map((item, index) => (
                    <li key={index} className={styles.prosItem}>
                      <span className={styles.prosCheck}>✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {review.cons && review.cons.length > 0 && (
              <div className={styles.consCard}>
                <div className={styles.consHeader}>
                  <span className={styles.consIcon}>❌</span>
                  <h3 className={styles.consTitle}>السلبيات</h3>
                </div>
                <ul className={styles.consList}>
                  {review.cons.map((item, index) => (
                    <li key={index} className={styles.consItem}>
                      <span className={styles.consCross}>✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        {/* Share Section */}
        <div className={styles.shareSection}>
          <span className={styles.shareLabel}>شارك المراجعة:</span>
          <div className={styles.shareButtons}>
            <button 
              className={styles.shareBtn}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: review.title,
                    text: review.summary || '',
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('تم نسخ الرابط!');
                }
              }}
            >
              📤 مشاركة
            </button>
            <button 
              className={styles.shareBtn}
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('تم نسخ الرابط!');
              }}
            >
              🔗 نسخ الرابط
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <section className={styles.commentsSection}>
          <div className={styles.commentsHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.commentsIcon}>💬</span>
              التعليقات ({comments.length})
            </h2>
          </div>
          <CommentForm reviewId={review.id || review._id || ''} onCommentAdded={handleCommentAdded} />
          <CommentList comments={comments} />
        </section>
      </article>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button className={styles.scrollTop} onClick={scrollToTop} aria-label="العودة للأعلى">
          ↑
        </button>
      )}
    </>
  );
}
