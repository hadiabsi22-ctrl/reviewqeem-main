'use client';

import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.title}>ReviewQeem</h3>
            <p className={styles.description}>
              منصة عربية احترافية لمراجعات الألعاب، تقييمات دقيقة وتحليل عميق لأهم ألعاب الفيديو.
            </p>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>روابط سريعة</h4>
            <ul className={styles.links}>
              <li><Link href="/">الرئيسية</Link></li>
              <li><Link href="/reviews">المراجعات</Link></li>
              <li><Link href="/categories">الفئات</Link></li>
            </ul>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>معلومات</h4>
            <ul className={styles.links}>
              <li><Link href="/about">من نحن</Link></li>
              <li><Link href="/contact">اتصل بنا</Link></li>
              <li><Link href="/privacy">سياسة الخصوصية</Link></li>
              <li><Link href="/terms">شروط الاستخدام</Link></li>
            </ul>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>تابعنا</h4>
            <p className={styles.copyright}>
              © {new Date().getFullYear()} ReviewQeem. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
