# متغيرات البيئة المطلوبة في Vercel
## Required Environment Variables for Vercel

**تاريخ:** 2025-01-28

---

## ⚠️ مهم جداً: يجب إضافة جميع هذه المتغيرات في Vercel Dashboard

اذهب إلى: **Vercel Dashboard → Project → Settings → Environment Variables**

---

## ✅ المتغيرات المطلوبة (Required)

### 1. NODE_ENV
```
NODE_ENV=production
```
**الوصف:** بيئة التشغيل

---

### 2. JWT_SECRET
```
JWT_SECRET=your-strong-random-secret-key-minimum-32-characters
```
**الوصف:** مفتاح JWT للتوقيع  
**كيفية إنشائه:**
```bash
# في Terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 3. ADMIN_EMAIL
```
ADMIN_EMAIL=admin@reviewqeem.com
```
**الوصف:** بريد الأدمن الافتراضي

---

### 4. ADMIN_PASSWORD
```
ADMIN_PASSWORD=your-strong-password-minimum-12-characters
```
**الوصف:** كلمة مرور الأدمن  
**ملاحظة:** يجب أن تكون 12 حرف على الأقل

---

### 5. ENCRYPTION_KEY
```
ENCRYPTION_KEY=your-32-byte-hex-encryption-key
```
**الوصف:** مفتاح التشفير للبيانات المحلية  
**كيفية إنشائه:**
```bash
# في Terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 6. ALLOWED_ORIGINS
```
ALLOWED_ORIGINS=https://your-domain.vercel.app,https://www.your-domain.vercel.app
```
**الوصف:** النطاقات المسموحة للـ CORS  
**مثال:**
```
ALLOWED_ORIGINS=https://reviewqeem.vercel.app
```
أو إذا كان لديك domain مخصص:
```
ALLOWED_ORIGINS=https://reviewqeem.com,https://www.reviewqeem.com
```

---

## ⚠️ المتغيرات الاختيارية (Optional)

### 7. SITE_URL
```
SITE_URL=https://your-domain.vercel.app
```
**الوصف:** رابط الموقع (لـ sitemap.xml)  
**ملاحظة:** إذا لم يتم تعيينه، سيستخدم VERCEL_URL تلقائياً

---

### 8. SUPABASE_URL
```
SUPABASE_URL=https://your-project.supabase.co
```
**الوصف:** رابط Supabase (إذا كنت تستخدم Supabase)

---

### 9. SUPABASE_KEY
```
SUPABASE_KEY=your-supabase-anon-key
```
**الوصف:** مفتاح Supabase (إذا كنت تستخدم Supabase)

---

### 10. SUPABASE_BUCKET
```
SUPABASE_BUCKET=game_reviews
```
**الوصف:** اسم الـ bucket في Supabase Storage

---

## 📝 خطوات الإضافة في Vercel

1. **اذهب إلى Vercel Dashboard**
   - اختر مشروعك

2. **Settings → Environment Variables**

3. **أضف كل متغير:**
   - Key: اسم المتغير (مثل `JWT_SECRET`)
   - Value: القيمة
   - Environment: اختر `Production`, `Preview`, `Development` (أو كلها)

4. **احفظ**

5. **أعد النشر (Redeploy)**

---

## 🔍 التحقق من المتغيرات

بعد إضافة المتغيرات، تأكد من:
1. إعادة النشر (Redeploy)
2. فتح Logs في Vercel
3. التحقق من عدم وجود أخطاء

---

## ⚠️ أخطاء شائعة

### خطأ: "JWT_SECRET is required"
**الحل:** أضف `JWT_SECRET` في Environment Variables

### خطأ: "CORS blocked"
**الحل:** حدث `ALLOWED_ORIGINS` بالـ URL الصحيح

### خطأ: "Admin not found"
**الحل:** تأكد من `ADMIN_EMAIL` و `ADMIN_PASSWORD`

---

## 🎯 قائمة التحقق

- [ ] NODE_ENV=production
- [ ] JWT_SECRET (32+ حرف)
- [ ] ADMIN_EMAIL
- [ ] ADMIN_PASSWORD (12+ حرف)
- [ ] ENCRYPTION_KEY (64 حرف hex)
- [ ] ALLOWED_ORIGINS (URL الصحيح)
- [ ] SITE_URL (اختياري)
- [ ] SUPABASE_URL (إذا كنت تستخدم Supabase)
- [ ] SUPABASE_KEY (إذا كنت تستخدم Supabase)
- [ ] SUPABASE_BUCKET (إذا كنت تستخدم Supabase)

---

**نهاية الدليل**
