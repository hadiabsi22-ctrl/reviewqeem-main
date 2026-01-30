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

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [activeTab, setActiveTab] = useState<'account' | 'password' | 'system'>('account');

  // Account settings
  const [accountData, setAccountData] = useState({
    username: '',
    email: '',
  });

  // Password settings
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/management-station/login');
      return;
    }

    // Load admin data
    fetch('/api/management-station/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.admin) {
          const adminData = data.data.admin;
          setAdmin(adminData);
          setAccountData({
            username: adminData.username || '',
            email: adminData.email || '',
          });
        } else {
          router.push('/management-station/login');
        }
      })
      .catch(() => {
        router.push('/management-station/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/management-station/login');
      return;
    }

    try {
      const response = await fetch('/api/management-station/settings/account', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(accountData),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('تم تحديث معلومات الحساب بنجاح');
        if (data.data?.admin) {
          setAdmin(data.data.admin);
        }
      } else {
        setError(data.message || 'فشل تحديث معلومات الحساب');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('كلمة المرور الجديدة وتأكيدها غير متطابقين');
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setSaving(false);
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/management-station/login');
      return;
    }

    try {
      const response = await fetch('/api/management-station/settings/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('تم تغيير كلمة المرور بنجاح');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setError(data.message || 'فشل تغيير كلمة المرور');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال بالخادم');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/management-station" className={styles.backBtn}>
            ← العودة
          </Link>
          <h1>الإعدادات</h1>
        </div>
      </header>

      <main className={styles.main}>
        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={activeTab === 'account' ? styles.activeTab : ''}
            onClick={() => setActiveTab('account')}
          >
            معلومات الحساب
          </button>
          <button
            className={activeTab === 'password' ? styles.activeTab : ''}
            onClick={() => setActiveTab('password')}
          >
            تغيير كلمة المرور
          </button>
          <button
            className={activeTab === 'system' ? styles.activeTab : ''}
            onClick={() => setActiveTab('system')}
          >
            معلومات النظام
          </button>
        </div>

        {/* Messages */}
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className={styles.section}>
            <h2>معلومات الحساب</h2>
            <form onSubmit={handleAccountUpdate} className={styles.form}>
              <div className={styles.field}>
                <label>اسم المستخدم *</label>
                <input
                  type="text"
                  value={accountData.username}
                  onChange={(e) => setAccountData({ ...accountData, username: e.target.value })}
                  required
                  placeholder="اسم المستخدم"
                />
              </div>

              <div className={styles.field}>
                <label>البريد الإلكتروني *</label>
                <input
                  type="email"
                  value={accountData.email}
                  onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                  required
                  placeholder="البريد الإلكتروني"
                />
              </div>

              <div className={styles.field}>
                <label>الدور</label>
                <input
                  type="text"
                  value={admin?.role === 'superadmin' ? 'مدير عام' : 'مدير'}
                  disabled
                  className={styles.disabled}
                />
              </div>

              <button type="submit" disabled={saving} className={styles.submitBtn}>
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className={styles.section}>
            <h2>تغيير كلمة المرور</h2>
            <form onSubmit={handlePasswordUpdate} className={styles.form}>
              <div className={styles.field}>
                <label>كلمة المرور الحالية *</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  placeholder="أدخل كلمة المرور الحالية"
                />
              </div>

              <div className={styles.field}>
                <label>كلمة المرور الجديدة *</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
                  minLength={6}
                />
              </div>

              <div className={styles.field}>
                <label>تأكيد كلمة المرور الجديدة *</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  minLength={6}
                />
              </div>

              <button type="submit" disabled={saving} className={styles.submitBtn}>
                {saving ? 'جاري التحديث...' : 'تغيير كلمة المرور'}
              </button>
            </form>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className={styles.section}>
            <h2>معلومات النظام</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>المنصة:</span>
                <span className={styles.infoValue}>Next.js 14.2.35 + TypeScript</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>البيئة:</span>
                <span className={styles.infoValue}>
                  {typeof window !== 'undefined' 
                    ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                        ? 'Development' 
                        : 'Production')
                    : 'Unknown'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>المنفذ:</span>
                <span className={styles.infoValue}>
                  {typeof window !== 'undefined' ? window.location.port || '3001' : '3001'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>البروتوكول:</span>
                <span className={styles.infoValue}>
                  {typeof window !== 'undefined' ? window.location.protocol : 'http:'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>النطاق:</span>
                <span className={styles.infoValue}>
                  {typeof window !== 'undefined' ? window.location.hostname : 'localhost'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>معرف الحساب:</span>
                <span className={styles.infoValue}>{admin?.id || 'N/A'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>البريد الإلكتروني:</span>
                <span className={styles.infoValue}>{admin?.email || 'N/A'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>اسم المستخدم:</span>
                <span className={styles.infoValue}>{admin?.username || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
