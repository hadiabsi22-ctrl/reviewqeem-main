'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './Header.module.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.content}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>RQ</span>
            <span className={styles.logoText}>ReviewQeem</span>
          </Link>
          <nav className={styles.nav}>
            <Link href="/">الرئيسية</Link>
            <Link href="/reviews">المراجعات</Link>
            <Link href="/theories">النظريات</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
