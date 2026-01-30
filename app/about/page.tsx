import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export const metadata = {
  title: 'من نحن - ReviewQeem',
  description: 'تعرف على ReviewQeem - منصة عربية احترافية لمراجعات الألعاب',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>من نحن</h1>
          <div className={styles.content}>
            <section className={styles.section}>
              <h2>مرحباً بك في ReviewQeem</h2>
              <p>
                ReviewQeem هي منصة عربية احترافية متخصصة في مراجعات الألعاب. نقدم تقييمات دقيقة
                وتحليل عميق لأهم ألعاب الفيديو على مختلف المنصات.
              </p>
            </section>

            <section className={styles.section}>
              <h2>رؤيتنا</h2>
              <p>
                نهدف إلى أن نكون المصدر العربي الأول والموثوق لمراجعات الألعاب، حيث نقدم محتوى
                عالي الجودة يساعد اللاعبين العرب في اتخاذ قرارات مستنيرة عند شراء الألعاب.
              </p>
            </section>

            <section className={styles.section}>
              <h2>مهمتنا</h2>
              <p>
                تقديم مراجعات شاملة وموضوعية للألعاب، مع التركيز على الجودة والشفافية. نحن
                ملتزمون بتقديم محتوى أصلي ومفيد للمجتمع العربي من محبي الألعاب.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
