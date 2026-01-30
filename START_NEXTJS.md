# 🚀 كيفية تشغيل Next.js على Port 3001

## ⚠️ ملاحظة مهمة

المشروع القديم (Express.js) يعمل على port 8093.
المشروع الجديد (Next.js) سيعمل على **port 3001**.

## 📋 الخطوات

### 1. نسخ package.json الجديد

```bash
# نسخ ملف Next.js package
cp package-nextjs.json package.json
```

### 2. تثبيت Dependencies

```bash
npm install
```

هذا سيثبت:
- Next.js 14
- React 18
- TypeScript
- جميع dependencies المطلوبة

### 3. إنشاء ملف .env.local

```bash
# نسخ مثال Environment Variables
# ثم عدّل القيم حسب حاجتك
```

محتوى `.env.local`:
```env
NODE_ENV=development
JWT_SECRET=your-secret-key-here
ENCRYPTION_KEY=your-encryption-key-here
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-password
NEXT_PUBLIC_API_URL=http://localhost:3001/api
PORT=3001
```

### 4. تشغيل Next.js

```bash
# Development (على port 3001)
npm run dev

# أو Production
npm run build
npm start
```

## 🌐 الروابط

بعد `npm run dev`، افتح:
- ✅ http://localhost:3001 - الصفحة الرئيسية
- ✅ http://localhost:3001/reviews - قائمة المراجعات
- ✅ http://localhost:3001/admin/login - تسجيل دخول Admin

## 🔄 الخيارات

### الخيار 1: استخدام Next.js فقط (موصى به)
- Next.js على port 3001 (Frontend + API)
- Express.js على port 8093 (يمكن إيقافه)

### الخيار 2: استخدام Express.js + Next.js معاً
- Express.js على port 8093 (API فقط)
- Next.js على port 3001 (Frontend فقط)
- عدّل `lib/api-config.ts` ليشير إلى Express.js API

## ✅ التحقق من العمل

1. شغّل Next.js: `npm run dev`
2. افتح: http://localhost:3001
3. يجب أن ترى الصفحة الرئيسية

## 🆘 حل المشاكل

### خطأ: "Cannot find module 'next'"
```bash
npm install
```

### خطأ: Port 3001 already in use
```bash
# أوقف البرنامج الذي يستخدم port 3001
# أو غيّر PORT في package.json scripts
```

### خطأ: TypeScript errors
```bash
npm run type-check
```

## 📝 ملاحظات

- ✅ Next.js سيعمل على **port 3001** تلقائياً
- ✅ Express.js لا يزال يعمل على port 8093 (إذا كان مشغول)
- ✅ يمكن استخدام الاثنين معاً بدون تعارض
