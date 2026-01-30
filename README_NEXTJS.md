# 🚀 ReviewQeem - Next.js + TypeScript

## 📋 نظرة عامة

هذا هو المشروع الجديد لـ ReviewQeem بعد التحويل إلى Next.js 14 مع TypeScript و App Router.

## 🎯 المميزات

- ✅ **Next.js 14** مع App Router
- ✅ **TypeScript** للـ Type Safety
- ✅ **Server-Side Rendering (SSR)**
- ✅ **API Routes** مدمجة
- ✅ **Optimized Images** تلقائياً
- ✅ **RTL Support** للغة العربية

## 🚀 البدء السريع

### 1. تثبيت Dependencies

```bash
# نسخ package-nextjs.json إلى package.json
cp package-nextjs.json package.json

# تثبيت Dependencies
npm install
```

### 2. إعداد Environment Variables

أنشئ ملف `.env.local`:

```env
NODE_ENV=development
ENCRYPTION_KEY=your-encryption-key-here
NEXT_PUBLIC_API_URL=http://localhost:3001/api
PORT=3001
```

### 3. تشغيل المشروع

```bash
# Development (على port 3001)
npm run dev

# Build
npm run build

# Production (على port 3001)
npm start
```

**ملاحظة**: Next.js سيعمل على **port 3001** تلقائياً (لتجنب التعارض مع Express.js على port 8093)

## 📁 بنية المشروع

```
reviewqeem-nextjs/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── comments/
│   │   └── reviews/
│   ├── admin/             # Admin Pages
│   ├── reviews/           # Review Pages
│   ├── layout.tsx          # Root Layout
│   ├── page.tsx           # Home Page
│   └── globals.css        # Global Styles
├── components/            # React Components
├── lib/                   # Utilities & Models
│   ├── models/           # Data Models
│   ├── storage/          # Local Storage
│   └── utils/            # Utilities
├── types/                # TypeScript Types
├── public/               # Static Files
│   ├── images/
│   └── uploads/
└── data/                 # Local Storage Data
```

## 🔄 التحويل من Express.js

المشروع الأصلي كان يعمل على Express.js. تم تحويله إلى Next.js مع الحفاظ على:
- ✅ نفس البيانات (LocalStorage)
- ✅ نفس Models
- ✅ نفس API structure
- ✅ نفس الوظائف

## 📝 API Routes

### Comments
- `GET /api/comments/review/[reviewId]` - جلب تعليقات مراجعة
- `POST /api/comments` - إنشاء تعليق جديد

### Reviews (قيد التنفيذ)
- `GET /api/reviews` - جلب جميع المراجعات
- `GET /api/reviews/[id]` - جلب مراجعة محددة
- `POST /api/reviews` - إنشاء مراجعة جديدة

## 🛠️ التطوير

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 📚 التوثيق

- راجع `MIGRATION_TO_NEXTJS.md` لمعرفة خطة التحويل الكاملة
- راجع `types/index.ts` لمعرفة جميع Types المتاحة

## 🚢 النشر

المشروع جاهز للنشر على Vercel:

```bash
# تثبيت Vercel CLI
npm i -g vercel

# النشر
vercel
```

## 📄 الرخصة

ISC

---

**تم الإنشاء**: 2026-01-29
**الإصدار**: 2.0.0
