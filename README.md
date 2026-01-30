# ReviewQeem - منصة مراجعات الألعاب العربية

منصة حديثة ومتجاوبة بالكامل مخصصة لمراجعات ألعاب الفيديو عالية الجودة والتقييمات والتعليقات.

## ✨ المميزات

- 🎮 مراجعات شاملة للألعاب
- 📚 نظريات وتحليلات
- ⭐ نظام تقييم متقدم
- 💬 نظام تعليقات تفاعلي
- 🔐 لوحة تحكم إدارية آمنة (`/management-station`)
- 📱 تصميم متجاوب بالكامل
- 🔒 أمان عالي المستوى
- 📊 إحصائيات مفصلة
- 🎨 واجهة مستخدم عصرية
- 📝 محرر نصوص غني (TipTap)

## 🚀 النشر السريع

### على Vercel (موصى به)

1. **ارفع المشروع إلى GitHub**
   ```bash
   git push origin main
   ```

2. **اذهب إلى [vercel.com](https://vercel.com)**
   - سجل دخول بحساب GitHub
   - اضغط "Add New Project"
   - اختر المستودع

3. **أضف Environment Variables:**
   ```env
   NODE_ENV=production
   JWT_SECRET=your-strong-secret-key-here
   NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
   ADMIN_EMAIL=admin@reviewqeem.com
   ADMIN_PASSWORD=your-password
   ENCRYPTION_KEY=your-encryption-key
   ```

4. **اضغط Deploy**

📖 **دليل مفصل:** راجع [SECURITY_REPORT.md](./SECURITY_REPORT.md)

## 🛠️ التثبيت المحلي

### المتطلبات

- Node.js 20.x
- npm أو yarn

### الخطوات

1. **استنساخ المشروع**
   ```bash
   git clone https://github.com/hadiabsi22-ctrl/reviewqeem.git
   cd reviewqeem
   ```

2. **تثبيت المكتبات**
   ```bash
   npm install
   ```

3. **إعداد Environment Variables**
   
   أنشئ ملف `.env.local`:
   ```env
   NODE_ENV=development
   JWT_SECRET=your-secret-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3001
   ADMIN_EMAIL=admin@reviewqeem.com
   ADMIN_PASSWORD=your-password
   ENCRYPTION_KEY=your-encryption-key
   ```

4. **تشغيل السيرفر**
   ```bash
   npm run dev
   # أو للإنتاج
   npm run build
   npm start
   ```

5. **افتح المتصفح**
   ```
   http://localhost:3001
   ```

## 📁 هيكل المشروع

```
reviewqeem/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes
│   ├── management-station/ # لوحة التحكم الإدارية
│   ├── reviews/            # صفحات المراجعات
│   ├── theories/           # صفحات النظريات
│   ├── sitemap.ts          # Sitemap ديناميكي
│   └── robots.ts           # Robots.txt ديناميكي
├── components/             # React Components
├── lib/                    # Utilities & Models
│   ├── middleware/         # Authentication
│   ├── models/             # Data Models
│   ├── storage/            # Local Storage
│   └── utils/              # Utilities (Sanitize)
├── types/                  # TypeScript Types
├── uploads/                # الملفات المرفوعة
└── data/                   # البيانات المشفرة
```

## 🔒 الأمان

تم تطبيق إصلاحات أمنية شاملة:

- ✅ JWT Authentication
- ✅ Middleware Protection
- ✅ Input Sanitization (DOMPurify)
- ✅ File Upload Validation
- ✅ Path Traversal Protection
- ✅ Security Headers (X-Frame-Options, X-XSS-Protection)
- ✅ CORS Configuration

📖 **التفاصيل الكاملة:** راجع [SECURITY_REPORT.md](./SECURITY_REPORT.md)

## 📚 الوثائق

- [تقرير الأمن والحماية](./SECURITY_REPORT.md)
- [حالة المشروع](./PROJECT_STATUS.md)
- [دليل التحويل إلى Next.js](./MIGRATION_TO_NEXTJS.md)

## 🛡️ Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | بيئة التشغيل (development/production) | ❌ |
| `JWT_SECRET` | مفتاح JWT للمصادقة | ✅ |
| `NEXT_PUBLIC_SITE_URL` | رابط الموقع (للفهرسة) | ✅ |
| `ADMIN_EMAIL` | بريد الأدمن | ✅ |
| `ADMIN_PASSWORD` | كلمة مرور الأدمن | ✅ |
| `ENCRYPTION_KEY` | مفتاح التشفير للبيانات | ✅ |

## 🔍 فهرسة محركات البحث

- ✅ **Sitemap ديناميكي:** `/sitemap.xml` (يُحدث تلقائياً)
- ✅ **Robots.txt ديناميكي:** `/robots.txt` (يُحدث تلقائياً)
- ✅ **فهرسة تلقائية:** كل مراجعة/نظرية جديدة تُفهرس تلقائياً

## 📝 الرخصة

ISC

## 👤 المؤلف

[hadiabsi22-ctrl](https://github.com/hadiabsi22-ctrl)

## 🔗 الروابط

- **المستودع:** [GitHub](https://github.com/hadiabsi22-ctrl/reviewqeem)
- **النشر:** [Vercel](https://reviewqeem.vercel.app)

---

**ملاحظة:** تأكد من تعيين جميع Environment Variables قبل النشر!
