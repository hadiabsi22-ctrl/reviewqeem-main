# دليل النشر على Vercel
## Vercel Deployment Guide

**تاريخ:** 2025-01-28

---

## ✅ تم رفع المشروع إلى GitHub

المشروع موجود الآن على: [https://github.com/hadiabsi22-ctrl/reviewqeem](https://github.com/hadiabsi22-ctrl/reviewqeem)

---

## 🚀 النشر على Vercel

### الطريقة 1: من خلال الموقع (أسهل)

1. **اذهب إلى [vercel.com](https://vercel.com)**
   - سجل دخول بحساب GitHub

2. **اضغط على "Add New Project"**

3. **اختر المستودع**
   - اختر `hadiabsi22-ctrl/reviewqeem`

4. **إعدادات المشروع:**
   - **Framework Preset:** Other
   - **Root Directory:** `./` (افتراضي)
   - **Build Command:** اتركه فارغاً
   - **Output Directory:** اتركه فارغاً
   - **Install Command:** `npm install`

5. **Environment Variables (مهم جداً!):**
   اضغط على "Environment Variables" وأضف:

   ```env
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=your-strong-random-secret-key-here
   ADMIN_EMAIL=admin@reviewqeem.com
   ADMIN_PASSWORD=your-strong-admin-password-here
   ENCRYPTION_KEY=your-32-byte-hex-encryption-key-here
   ALLOWED_ORIGINS=https://reviewqeem.vercel.app
   ```

   **ملاحظة:** استبدل القيم بقيمك الحقيقية!

6. **اضغط "Deploy"**

---

### الطريقة 2: من خلال CLI

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# النشر
vercel

# اتبع التعليمات على الشاشة
```

---

## ⚙️ إعدادات Vercel المطلوبة

### ملف `vercel.json` (موجود بالفعل)

الملف موجود ويحتوي على:
- إعدادات الـ builds
- Routes للـ API
- Routes للملفات الثابتة
- إعدادات Functions

### Environment Variables المطلوبة

في لوحة Vercel → Settings → Environment Variables:

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | ✅ |
| `JWT_SECRET` | `your-secret-key` | ✅ |
| `ADMIN_EMAIL` | `admin@reviewqeem.com` | ✅ |
| `ADMIN_PASSWORD` | `your-password` | ✅ |
| `ENCRYPTION_KEY` | `your-encryption-key` | ✅ |
| `ALLOWED_ORIGINS` | `https://reviewqeem.vercel.app` | ✅ |
| `SUPABASE_URL` | `your-url` | ⚠️ اختياري |
| `SUPABASE_KEY` | `your-key` | ⚠️ اختياري |

---

## 🔧 تحديثات مطلوبة لـ Vercel

### 1. تحديث PORT في server.js

Vercel يستخدم PORT تلقائياً، لكن تأكد من:

```javascript
const PORT = process.env.PORT || 8093;
```

### 2. تحديث API_BASE في الملفات

في جميع ملفات HTML، تأكد من تحديث `API_BASE`:

```javascript
// بدلاً من
const API_BASE = "http://127.0.0.1:8093/api";

// استخدم
const API_BASE = window.location.origin + "/api";
// أو
const API_BASE = "https://reviewqeem.vercel.app/api";
```

---

## 📝 خطوات ما بعد النشر

### 1. تحديث CORS

بعد النشر، احصل على URL من Vercel (مثل: `https://reviewqeem.vercel.app`)

ثم حدث Environment Variable:
```
ALLOWED_ORIGINS=https://reviewqeem.vercel.app
```

### 2. اختبار الموقع

- افتح الموقع: `https://reviewqeem.vercel.app`
- اختبر تسجيل الدخول
- اختبر إضافة مراجعة
- اختبر رفع الصور

### 3. تحديث Domain (اختياري)

في Vercel → Settings → Domains:
- أضف domain مخصص
- حدث `ALLOWED_ORIGINS` بالـ domain الجديد

---

## ⚠️ ملاحظات مهمة

### 1. التخزين المحلي في Vercel

⚠️ **مشكلة:** Vercel يستخدم serverless functions، والتخزين المحلي (`data/*.encrypted`) **لن يعمل** لأن:
- كل request قد يذهب لـ function مختلف
- الملفات المحلية غير مستمرة
- البيانات قد تُفقد

**الحلول:**
- استخدم قاعدة بيانات خارجية (MongoDB, PostgreSQL)
- أو استخدم Vercel KV (Redis)
- أو استخدم Supabase

### 2. رفع الملفات

⚠️ **مشكلة:** مجلد `uploads/` لن يعمل في Vercel

**الحلول:**
- استخدم Supabase Storage (موجود في الكود)
- أو استخدم Cloudinary
- أو استخدم AWS S3

### 3. Environment Variables

✅ **مهم:** لا ترفع ملف `.env` إلى GitHub
- استخدم Environment Variables في Vercel
- جميع القيم الحساسة يجب أن تكون في Vercel Dashboard

---

## 🔄 تحديثات تلقائية

Vercel يربط تلقائياً مع GitHub:
- كل push إلى `main` → نشر تلقائي
- يمكنك تعطيله من Settings → Git

---

## 📊 مراقبة الأداء

في Vercel Dashboard:
- **Analytics:** إحصائيات الزوار
- **Logs:** سجلات الأخطاء
- **Functions:** أداء الـ API

---

## 🆘 استكشاف الأخطاء

### المشكلة: "Function timeout"
**الحل:** زيادة `maxDuration` في `vercel.json`

### المشكلة: "Environment variable not found"
**الحل:** تأكد من إضافة جميع المتغيرات في Vercel Dashboard

### المشكلة: "CORS error"
**الحل:** حدث `ALLOWED_ORIGINS` بالـ URL الصحيح

---

## ✅ قائمة التحقق قبل النشر

- [ ] تم رفع المشروع إلى GitHub
- [ ] تم إضافة جميع Environment Variables في Vercel
- [ ] تم تحديث `API_BASE` في الملفات
- [ ] تم تحديث `ALLOWED_ORIGINS` بالـ URL الصحيح
- [ ] تم اختبار الموقع بعد النشر
- [ ] تم اختبار تسجيل الدخول
- [ ] تم اختبار إضافة مراجعة

---

## 🎯 الخطوات التالية

1. **نشر على Vercel** (اتبع الخطوات أعلاه)
2. **اختبار الموقع** بعد النشر
3. **إضافة Domain مخصص** (اختياري)
4. **إعداد قاعدة بيانات** (إذا كنت تريد استمرارية البيانات)

---

**نهاية الدليل**
