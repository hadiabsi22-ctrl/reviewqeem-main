import { Review } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReviewCard from '@/components/ReviewCard';
import { ReviewLocal } from '@/lib/models/ReviewLocal';
import styles from './page.module.css';

async function getFeaturedReviews(): Promise<Review[]> {
  try {
    const allReviews = await ReviewLocal.find({ status: 'published' });
    
    // فلترة المراجعات فقط: المراجعات التي لها pros أو cons
    const reviewsOnly = allReviews
      .map((r) => r.toObject())
      .filter((review) => {
        const hasPros = review.pros && review.pros.length > 0;
        const hasCons = review.cons && review.cons.length > 0;
        return hasPros || hasCons; // مراجعة إذا كان لها pros أو cons
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 10); // آخر 10 مراجعات
    
    console.log(`📚 Found ${allReviews.length} published items, ${reviewsOnly.length} are reviews`);
    return reviewsOnly;
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
