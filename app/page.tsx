import { Review } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReviewCard from '@/components/ReviewCard';
import { ReviewLocal } from '@/lib/models/ReviewLocal';
import styles from './page.module.css';

async function getFeaturedReviews(): Promise<Review[]> {
  try {
    const reviews = await ReviewLocal.find({ status: 'published' });
    // عرض جميع المراجعات المنشورة بدون تصفية
    const sorted = reviews
      .map((r) => r.toObject())
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 10); // آخر 10 مراجعات
    return sorted;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

export default async function HomePage() {
  const reviews = await getFeaturedReviews();

  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.brand}>ReviewQeem</span>
            <h1>مراجعات الألعاب العربية</h1>
            <p>اكتشف أحدث المراجعات الاحترافية للألعاب بتقييمات دقيقة وتحليل عميق</p>
          </div>
        </section>

        <section className={styles.reviewsSection}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>أحدث المراجعات</h2>
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
              <p className={styles.empty}>لا توجد مراجعات متاحة حالياً</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
