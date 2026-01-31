import { Review } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReviewCard from '@/components/ReviewCard';
import { ReviewLocal } from '@/lib/models/ReviewLocal';
import styles from './page.module.css';

async function getAllTheories(): Promise<Review[]> {
  try {
    // جلب جميع المراجعات المنشورة
    const allReviews = await ReviewLocal.find({ status: 'published' });
    
    // فلترة النظريات: النظريات هي المراجعات التي ليس لها pros و cons
    const theories = allReviews
      .map((r) => r.toObject())
      .filter((review) => {
        // النظريات: pros و cons فارغين أو غير موجودين
        const prosArray = review.pros || [];
        const consArray = review.cons || [];
        const hasNoPros = !Array.isArray(prosArray) || prosArray.length === 0;
        const hasNoCons = !Array.isArray(consArray) || consArray.length === 0;
        return hasNoPros && hasNoCons;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // الأحدث أولاً
      });
    
    console.log(`📚 Found ${allReviews.length} published reviews, ${theories.length} are theories`);
    if (theories.length > 0) {
      console.log(`📖 Theories:`, theories.map(t => ({ title: t.title, pros: t.pros?.length || 0, cons: t.cons?.length || 0 })));
    }
    return theories;
  } catch (error) {
    console.error('Error fetching theories:', error);
    return [];
  }
}

export const metadata = {
  title: 'النظريات - ReviewQeem',
  description: 'استعرض جميع النظريات والتحليلات الاحترافية للألعاب.',
};

export default async function TheoriesPage() {
  const theories = await getAllTheories();

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>النظريات</h1>
            <p className={styles.subtitle}>
              {theories.length > 0 ? (
                <>
                  <span className={styles.count}>{theories.length}</span> نظرية متاحة للقراءة
                </>
              ) : (
                'لا توجد نظريات متاحة حالياً'
              )}
            </p>
          </div>
          
          {theories.length > 0 ? (
            <>
              {/* Desktop Grid */}
              <div className={styles.grid}>
                {theories.map((theory) => (
                  <ReviewCard key={theory.id || theory._id} review={theory} />
                ))}
              </div>
              {/* Mobile Horizontal Scroll */}
              <div className={styles.mobileScroll}>
                {theories.map((theory) => (
                  <ReviewCard key={theory.id || theory._id} review={theory} />
                ))}
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📚</div>
              <p>لا توجد نظريات متاحة حالياً</p>
              <p className={styles.emptySubtext}>سيتم إضافة نظريات جديدة قريباً</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
