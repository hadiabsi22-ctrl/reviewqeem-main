'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

interface Admin {
  id: string;
  email: string;
  username: string;
  role: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/management-station/login');
      return;
    }

    fetch('/api/admin/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAdmin(data.data.admin);
        } else {
          localStorage.removeItem('adminToken');
          router.push('/management-station/login');
        }
      })
      .catch(() => {
        router.push('/management-station/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      localStorage.removeItem('adminToken');
      // حذف cookie أيضاً
      document.cookie = 'adminToken=; path=/; max-age=0';
      router.push('/management-station/login');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>جاري التحميل...</div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h1>لوحة التحكم</h1>
            <p className={styles.welcomeText}>مرحباً بك، {admin.username || admin.email}</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {admin.username?.[0]?.toUpperCase() || admin.email[0].toUpperCase()}
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userEmail}>{admin.email}</span>
                <span className={styles.userRole}>{admin.role === 'superadmin' ? 'مدير عام' : 'مدير'}</span>
              </div>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <span className={styles.logoutIcon}>🚪</span>
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.grid}>
          <Link href="/management-station/reviews" className={`${styles.card} ${styles.reviewsCard}`}>
            <div className={styles.cardIcon}>📝</div>
            <div className={styles.cardContent}>
              <h2>المراجعات</h2>
              <p>إدارة جميع المراجعات</p>
            </div>
            <div className={styles.cardArrow}>→</div>
          </Link>

          <Link href="/management-station/theories" className={`${styles.card} ${styles.reviewsCard}`}>
            <div className={styles.cardIcon}>📚</div>
            <div className={styles.cardContent}>
              <h2>النظريات</h2>
              <p>إدارة جميع النظريات</p>
            </div>
            <div className={styles.cardArrow}>→</div>
          </Link>

          <Link href="/management-station/comments" className={`${styles.card} ${styles.commentsCard}`}>
            <div className={styles.cardIcon}>💬</div>
            <div className={styles.cardContent}>
              <h2>التعليقات</h2>
              <p>إدارة التعليقات والموافقات</p>
            </div>
            <div className={styles.cardArrow}>→</div>
          </Link>

          <Link href="/management-station/stats" className={`${styles.card} ${styles.statsCard}`}>
            <div className={styles.cardIcon}>📊</div>
            <div className={styles.cardContent}>
              <h2>الإحصائيات</h2>
              <p>عرض إحصائيات الموقع</p>
            </div>
            <div className={styles.cardArrow}>→</div>
          </Link>

          <Link href="/management-station/settings" className={`${styles.card} ${styles.settingsCard}`}>
            <div className={styles.cardIcon}>⚙️</div>
            <div className={styles.cardContent}>
              <h2>الإعدادات</h2>
              <p>إعدادات النظام</p>
            </div>
            <div className={styles.cardArrow}>→</div>
          </Link>
        </div>
      </main>
    </div>
  );
}
