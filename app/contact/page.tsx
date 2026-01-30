'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // TODO: Implement contact form API
    setTimeout(() => {
      setMessage({ type: 'success', text: 'شكراً لك! سنتواصل معك قريباً.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>اتصل بنا</h1>
          <div className={styles.content}>
            <div className={styles.info}>
              <h2>نحن هنا لمساعدتك</h2>
              <p>
                لديك سؤال أو اقتراح؟ نحن سعداء بالاستماع إليك. تواصل معنا وسنرد عليك في أقرب
                وقت ممكن.
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {message && (
                <div className={`${styles.alert} ${styles[message.type]}`}>{message.text}</div>
              )}

              <div className={styles.formGroup}>
                <label>الاسم</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>البريد الإلكتروني</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>الموضوع</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>الرسالة</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={6}
                />
              </div>

              <button type="submit" disabled={loading} className={styles.submit}>
                {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
