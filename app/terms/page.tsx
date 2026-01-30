import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export const metadata = {
  title: 'شروط الاستخدام - ReviewQeem',
  description: 'شروط استخدام موقع ReviewQeem',
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>شروط الاستخدام</h1>
          <div className={styles.content}>
            <section className={styles.section}>
              <h2>القبول</h2>
              <p>
                باستخدام موقع ReviewQeem، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت
                لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام موقعنا.
              </p>
            </section>

            <section className={styles.section}>
              <h2>استخدام الموقع</h2>
              <p>
                يمكنك استخدام موقعنا للأغراض الشخصية فقط. لا يجوز لك استخدام الموقع لأي غرض
                غير قانوني أو غير مصرح به.
              </p>
            </section>

            <section className={styles.section}>
              <h2>المحتوى</h2>
              <p>
                جميع المحتويات على موقعنا محمية بحقوق الطبع والنشر. لا يجوز نسخ أو توزيع أو
                تعديل أي محتوى دون إذن كتابي منا.
              </p>
            </section>

            <section className={styles.section}>
              <h2>التعليقات</h2>
              <p>
                عند إرسال تعليق، أنت توافق على أن يكون محتوى التعليق مناسباً ولا ينتهك حقوق
                الآخرين. نحتفظ بالحق في حذف أي تعليق نعتبره غير مناسب.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
