# دليل إعداد Vercel - ReviewQeem

**تاريخ:** 2026-01-30

---

## ✅ الخطوات المكتملة

### 1. تنظيف ذاكرة Git Cache
- ✅ تم تنفيذ `git rm -r --cached .`
- ✅ تم تنفيذ `git add .`
- ✅ تم رفع جميع الملفات بالأسماء الصحيحة

### 2. التحقق من استدعاء components
- ✅ جميع الاستدعاءات تستخدم `@/components/` (حرف صغير)
- ✅ الملفات موجودة في `components/` (حرف صغير)

### 3. إعداد Node.js في Vercel
- ✅ `package.json` يحتوي على `"engines": { "node": "20.x" }`
- ✅ `vercel.json` يحتوي على `nodejs20.x` runtime

---

## 🔧 إعدادات Vercel المطلوبة

### 1. Project Settings → General

#### Framework Preset:
- **القيمة:** `Next.js`

#### Build & Development Settings:
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Root Directory:** `/` (فارغ)

#### Node.js Version:
- **القيمة:** `20.x` (يتم تحديده تلقائياً من `package.json`)

---

## 🔐 Environment Variables

اذهب إلى **Project Settings** → **Environment Variables** وأضف:

### متغيرات أساسية:
```
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### متغيرات الأمان:
```
JWT_SECRET=your-strong-secret-key-here-min-32-chars
ENCRYPTION_KEY=your-encryption-key-here-min-32-chars
```

### متغيرات الحساب:
```
ADMIN_EMAIL=admin@reviewqeem.com
ADMIN_PASSWORD=your-secure-password
```

### متغيرات npm (اختياري):
```
NPM_CONFIG_AUDIT=false
```

---

## 📋 قائمة التحقق

### قبل النشر:
- [x] تنظيف Git cache وإعادة رفع الملفات
- [x] التحقق من تطابق أسماء الملفات
- [x] التحقق من استدعاء `@/components/` (حرف صغير)
- [x] إضافة Node.js 20.x في vercel.json
- [ ] إضافة Environment Variables في Vercel
- [ ] التحقق من Framework Preset = Next.js

### بعد النشر:
- [ ] اختبار الموقع
- [ ] اختبار لوحة التحكم (`/management-station`)
- [ ] اختبار API routes
- [ ] إرسال Sitemap إلى Google Search Console

---

## 🚀 الخطوات النهائية

### 1. في Vercel Dashboard:
1. اذهب إلى **Project Settings** → **General**
2. تأكد من:
   - Framework Preset: **Next.js**
   - Node.js Version: **20.x**
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 2. إضافة Environment Variables:
1. اذهب إلى **Project Settings** → **Environment Variables**
2. أضف جميع المتغيرات المذكورة أعلاه
3. اختر **Production**, **Preview**, **Development**

### 3. إعادة النشر:
1. اذهب إلى **Deployments**
2. اضغط **Redeploy** على آخر deployment
3. أو انتظر حتى يبني Vercel تلقائياً

---

## ✅ الملفات المحدثة

- ✅ `vercel.json` - تم إضافة Node.js 20.x runtime
- ✅ جميع الملفات - تم تنظيف Git cache وإعادة رفعها

---

## 📝 ملاحظات مهمة

### Node.js Version:
- المشروع يستخدم **Node.js 20.x**
- تم تحديده في:
  - `package.json`: `"engines": { "node": "20.x" }`
  - `vercel.json`: `"runtime": "nodejs20.x"`

### Case Sensitivity:
- جميع الملفات تم رفعها بالأسماء الصحيحة
- `components/` (حرف صغير) ✅
- `TipTapEditor.tsx` (T كبير) ✅
- جميع الاستدعاءات متطابقة ✅

---

**آخر تحديث:** 2026-01-30
