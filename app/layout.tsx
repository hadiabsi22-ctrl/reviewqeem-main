// ==================== Root Layout ====================

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ReviewQeem - مراجعات الألعاب العربية',
  description: 'منصة عربية احترافية لمراجعات الألعاب، تقييمات دقيقة وتحليل عميق لأهم ألعاب الفيديو على مختلف المنصات.',
  keywords: 'مراجعات ألعاب, Game Reviews, PS5, Xbox, PC, Nintendo Switch',
  authors: [{ name: 'ReviewQeem' }],
  openGraph: {
    type: 'website',
    title: 'ReviewQeem - Arabic Game Reviews',
    description: 'اكتشف أحدث مراجعات الألعاب الاحترافية بالعربية على ReviewQeem.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://reviewqeem.online',
  },
};

export const viewport = {
  themeColor: '#6c5ce7',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  );
}
