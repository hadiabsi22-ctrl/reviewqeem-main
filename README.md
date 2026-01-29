# ReviewQeem - منصة مراجعات الألعاب العربية

منصة حديثة ومتجاوبة بالكامل مخصصة لمراجعات ألعاب الفيديو عالية الجودة والتقييمات والتعليقات.

## ✨ المميزات

- 🎮 مراجعات شاملة للألعاب
- ⭐ نظام تقييم متقدم
- 💬 نظام تعليقات تفاعلي
- 🔐 لوحة تحكم إدارية آمنة
- 📱 تصميم متجاوب بالكامل
- 🔒 أمان عالي المستوى
- 📊 إحصائيات مفصلة
- 🎨 واجهة مستخدم عصرية

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
   ```
   NODE_ENV=production
   JWT_SECRET=your-secret-key
   ADMIN_EMAIL=admin@reviewqeem.com
   ADMIN_PASSWORD=your-password
   ENCRYPTION_KEY=your-encryption-key
   ALLOWED_ORIGINS=https://your-domain.vercel.app
   ```

4. **اضغط Deploy**

📖 **دليل مفصل:** راجع [DEPLOY_VERCEL_GUIDE.md](./DEPLOY_VERCEL_GUIDE.md)

## 🛠️ التثبيت المحلي

### المتطلبات

- Node.js 16+ 
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
   
   أنشئ ملف `.env`:
   ```env
   PORT=8093
   NODE_ENV=development
   JWT_SECRET=your-secret-key
   ADMIN_EMAIL=admin@reviewqeem.com
   ADMIN_PASSWORD=your-password
   ENCRYPTION_KEY=your-encryption-key
   ALLOWED_ORIGINS=http://localhost:8093
   ```

4. **تشغيل السيرفر**
   ```bash
   npm start
   # أو للتطوير
   npm run dev
   ```

5. **افتح المتصفح**
   ```
   http://localhost:8093
   ```

## 📁 هيكل المشروع

```
reviewqeem/
├── server.js              # السيرفر الرئيسي
├── routes/                # API routes
├── models/                # نماذج البيانات
├── middleware/            # Middleware (Auth, etc.)
├── utils/                 # Utilities (Sanitize, Logger, etc.)
├── storage/               # نظام التخزين المحلي
├── css/                   # ملفات CSS
├── js/                    # ملفات JavaScript
├── uploads/               # الملفات المرفوعة
└── data/                  # البيانات المشفرة
```

## 🔒 الأمان

تم تطبيق إصلاحات أمنية شاملة:

- ✅ CORS محدود للنطاقات المصرح بها
- ✅ تنظيف المدخلات (Input Sanitization)
- ✅ فحص الملفات (Magic Bytes)
- ✅ CSRF Protection
- ✅ Security Logging
- ✅ Rate Limiting
- ✅ HTTPS Enforcement

📖 **التفاصيل:** راجع [SECURITY_FIXES_COMPLETE.md](./SECURITY_FIXES_COMPLETE.md)

## 📚 الوثائق

- [دليل النشر على Vercel](./DEPLOY_VERCEL_GUIDE.md)
- [دليل تفعيل HTTPS](./HTTPS_SETUP_GUIDE.md)
- [تقرير الأمان](./SECURITY_AUDIT_REPORT.md)
- [الإصلاحات الأمنية](./SECURITY_FIXES_COMPLETE.md)

## 🛡️ Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | منفذ السيرفر | ❌ (افتراضي: 8093) |
| `NODE_ENV` | بيئة التشغيل | ❌ |
| `JWT_SECRET` | مفتاح JWT | ✅ |
| `ADMIN_EMAIL` | بريد الأدمن | ✅ |
| `ADMIN_PASSWORD` | كلمة مرور الأدمن | ✅ |
| `ENCRYPTION_KEY` | مفتاح التشفير | ✅ |
| `ALLOWED_ORIGINS` | النطاقات المسموحة | ✅ |
| `SUPABASE_URL` | رابط Supabase | ⚠️ اختياري |
| `SUPABASE_KEY` | مفتاح Supabase | ⚠️ اختياري |

## 📝 الرخصة

ISC

## 👤 المؤلف

[hadiabsi22-ctrl](https://github.com/hadiabsi22-ctrl)

## 🔗 الروابط

- **المستودع:** [GitHub](https://github.com/hadiabsi22-ctrl/reviewqeem)
- **النشر:** [Vercel](https://reviewqeem.vercel.app)

---

**ملاحظة:** تأكد من تعيين جميع Environment Variables قبل النشر!
