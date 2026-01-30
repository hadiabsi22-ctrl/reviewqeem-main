import { Review } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReviewCard from '@/components/ReviewCard';
import { ReviewLocal } from '@/lib/models/ReviewLocal';
import styles from './page.module.css';

async function getAllReviews(): Promise<Review[]> {
  try {
    const reviews = await ReviewLocal.find({ status: 'published' });
    // عرض جميع المراجعات المنشورة بدون تصفية
    return reviews
      .map((r) => r.toObject())
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // الأحدث أولاً
      });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

export const metadata = {
  title: 'جميع المراجعات - ReviewQeem',
  description: 'استعرض جميع المراجعات الاحترافية للألعاب بتقييمات دقيقة وصور وملخصات شاملة.',
};

export default async function ReviewsPage() {
  const reviews = await getAllReviews();

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>جميع المراجعات</h1>
            <p className={styles.subtitle}>
              {reviews.length > 0 ? (
                <>
                  <span className={styles.count}>{reviews.length}</span> مراجعة متاحة للقراءة
                </>
              ) : (
                'لا توجد مراجعات متاحة حالياً'
              )}
            </p>
          </div>
          
          {reviews.length > 0 ? (
            <>
              {/* Desktop Grid */}
              <div className={styles.grid}>
                {reviews.map((review) => (
                  <ReviewCard key={review.id || review._id} review={review} />
                ))}
              </div>
              {/* Mobile Horizontal Scroll */}
              <div className={styles.mobileScroll}>
                {reviews.map((review) => (
                  <ReviewCard key={review.id || review._id} review={review} />
                ))}
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📝</div>
              <p>لا توجد مراجعات متاحة حالياً</p>
              <p className={styles.emptySubtext}>سيتم إضافة مراجعات جديدة قريباً</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
