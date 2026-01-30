import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export const metadata = {
  title: 'سياسة الخصوصية - ReviewQeem',
  description: 'سياسة الخصوصية لموقع ReviewQeem',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>سياسة الخصوصية</h1>
          <div className={styles.content}>
            <section className={styles.section}>
              <h2>مقدمة</h2>
              <p>
                نحن في ReviewQeem نلتزم بحماية خصوصيتك. هذه السياسة توضح كيفية جمع واستخدام
                المعلومات الشخصية على موقعنا.
              </p>
            </section>

            <section className={styles.section}>
              <h2>المعلومات التي نجمعها</h2>
              <p>
                نجمع المعلومات التي تقدمها لنا مباشرة، مثل اسمك وبريدك الإلكتروني عند إرسال
                تعليق أو التواصل معنا.
              </p>
            </section>

            <section className={styles.section}>
              <h2>كيف نستخدم المعلومات</h2>
              <p>
                نستخدم المعلومات التي نجمعها لتحسين خدماتنا وتقديم تجربة أفضل لك. لا نبيع أو
                نشارك معلوماتك الشخصية مع أطراف ثالثة.
              </p>
            </section>

            <section className={styles.section}>
              <h2>الأمان</h2>
              <p>
                نتخذ إجراءات أمنية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو
                التغيير أو الكشف.
              </p>
            </section>

            <section className={styles.section}>
              <h2>التغييرات على هذه السياسة</h2>
              <p>
                قد نحدث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات من خلال نشر السياسة
                الجديدة على هذه الصفحة.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
