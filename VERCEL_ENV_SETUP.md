# إعداد Environment Variables في Vercel

**تاريخ:** 2026-01-30

---

## ⚠️ ملاحظة مهمة

**ملف `.env` محمي في `.gitignore` ولن يُرفع على GitHub** - هذا صحيح لأسباب أمنية!

---

## 🔐 Environment Variables المطلوبة في Vercel

### 1. اذهب إلى Vercel Dashboard:
- Project Settings → **Environment Variables**

### 2. أضف المتغيرات التالية:

#### متغيرات أساسية:
```
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

#### متغيرات الأمان:
```
JWT_SECRET=sb_secret_A2q5PK0tnGPIh1sB7pKhvw_IeOSctIc
ENCRYPTION_KEY=your-encryption-key-here-min-32-chars
```

#### متغيرات الحساب:
```
ADMIN_EMAIL=admin@reviewqeem.com
ADMIN_PASSWORD=your-secure-password
```

#### متغيرات npm (اختياري):
```
NPM_CONFIG_AUDIT=false
```

---

## 📝 خطوات الإضافة في Vercel

1. **اذهب إلى:** Project Settings → Environment Variables
2. **اضغط:** "+ New secret key" أو "+ Add New"
3. **أضف كل متغير:**
   - **Key:** اسم المتغير (مثلاً `JWT_SECRET`)
   - **Value:** القيمة (مثلاً `sb_secret_A2q5PK0tnGPIh1sB7pKhvw_IeOSctIc`)
   - **Environment:** اختر Production, Preview, Development (أو الكل)
4. **اضغط:** Save
5. **كرر** لكل متغير

---

## ✅ قائمة التحقق

- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app`
- [ ] `JWT_SECRET=sb_secret_A2q5PK0tnGPIh1sB7pKhvw_IeOSctIc`
- [ ] `ENCRYPTION_KEY=your-encryption-key`
- [ ] `ADMIN_EMAIL=admin@reviewqeem.com`
- [ ] `ADMIN_PASSWORD=your-password`
- [ ] `NPM_CONFIG_AUDIT=false` (اختياري)

---

## 🚀 بعد إضافة المتغيرات

1. **إعادة النشر:**
   - اذهب إلى **Deployments**
   - اضغط **Redeploy** على آخر deployment
   - أو انتظر حتى يبني Vercel تلقائياً

---

## ⚠️ تحذير أمني

**لا ترفع ملف `.env` على GitHub أبداً!**

- ملف `.env` محمي في `.gitignore`
- استخدم Environment Variables في Vercel فقط
- استخدم `.env.example` كدليل (بدون قيم حقيقية)

---

**آخر تحديث:** 2026-01-30
