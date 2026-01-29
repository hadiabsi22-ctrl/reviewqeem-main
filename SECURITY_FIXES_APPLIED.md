# الإصلاحات الأمنية المطبقة
## Security Fixes Applied

**تاريخ:** 2025-01-28

---

## ✅ الإصلاحات المطبقة (Applied Fixes)

### 1. ✅ إصلاح مشكلة فتح المراجعات
- **الملف:** `routes/reviews.js`, `models/ReviewLocal.js`
- **التعديل:** تحسين البحث في `findOne` للبحث في `_id`, `id`, و `slug`
- **التعديل:** إضافة توليد تلقائي لـ `slug` إذا لم يكن موجوداً

### 2. ✅ إزالة Hardcoded Secrets
- **الملفات:** `server.js`, `routes/adminAuth.js`, `middleware/auth.js`, `routes/upload.js`
- **التعديل:** إزالة كلمات المرور والمفاتيح المكشوفة من الكود
- **التعديل:** إضافة تحقق من وجود environment variables
- **التعديل:** إضافة رسائل خطأ واضحة عند عدم وجود المتغيرات المطلوبة

### 3. ✅ تحسين Rate Limiting
- **الملف:** `server.js`
- **التعديل:** إضافة rate limiting منفصل لتسجيل الدخول (5 محاولات فقط)
- **التعديل:** تحسين الحد العام (100 في الإنتاج، 1000 في التطوير)
- **التعديل:** إضافة رسائل خطأ واضحة

### 4. ✅ تفعيل CSP (Content Security Policy)
- **الملف:** `server.js`
- **التعديل:** تفعيل CSP في الإنتاج
- **التعديل:** إضافة directives آمنة
- **التعديل:** تعطيل CSP في التطوير فقط

### 5. ✅ تحسين JWT Authentication
- **الملف:** `middleware/auth.js`
- **التعديل:** إزالة قبول token من query parameters
- **التعديل:** قبول token من Authorization header فقط
- **التعديل:** إضافة تحقق من JWT_SECRET

---

## ⚠️ الإصلاحات المطلوبة يدوياً (Manual Fixes Required)

### 1. ⚠️ إصلاح CORS
**الملف:** `server.js` (السطور 12-44)

**الكود الحالي:**
```javascript
app.options('*', cors());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || 
        origin.startsWith('http://localhost:') || 
        origin.startsWith('http://127.0.0.1:') ||
        origin.startsWith('file://')) {
      return callback(null, true);
    }
    callback(null, true); // يقبل أي origin!
  },
  // ...
}));
```

**الكود المطلوب:**
```javascript
// إعداد CORS آمن - يسمح فقط بالنطاقات المصرح بها
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:8093', 'http://127.0.0.1:8093'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    }
    
    if (allowedOrigins.includes(origin) || 
        (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) ||
        (process.env.NODE_ENV !== 'production' && origin.startsWith('http://127.0.0.1:'))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  maxAge: 86400
}));

// حذف middleware اليدوي (السطور 29-44)
```

---

### 2. ⚠️ إضافة Input Validation
**الملفات:** `routes/reviews.js`, `routes/comments.js`

**إضافة مكتبة:**
```bash
npm install express-validator
```

**مثال للاستخدام في `routes/reviews.js`:**
```javascript
const { body, validationResult } = require('express-validator');

router.post('/', authenticate, isAdmin, [
  body('title').trim().isLength({ min: 3, max: 200 }).escape(),
  body('content').trim().isLength({ min: 10 }).escape(),
  body('rating').isFloat({ min: 0, max: 10 }),
  body('status').isIn(['draft', 'published', 'archived'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  // ... باقي الكود
});
```

---

### 3. ⚠️ تحسين File Validation
**الملف:** `routes/upload.js`

**إضافة فحص magic bytes:**
```javascript
const fileType = require('file-type');

const fileFilter = async (req, file, cb) => {
  // ... الكود الحالي ...
  
  // فحص magic bytes بعد الرفع
  if (req.file) {
    const type = await fileType.fromBuffer(req.file.buffer);
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!type || !allowedMimes.includes(type.mime)) {
      return cb(new Error('نوع الملف غير صالح'), false);
    }
  }
  
  cb(null, true);
};
```

**تثبيت المكتبة:**
```bash
npm install file-type
```

---

### 4. ⚠️ إضافة CSRF Protection
**الملف:** `server.js`

**تثبيت المكتبة:**
```bash
npm install csurf cookie-parser
```

**إضافة في `server.js`:**
```javascript
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

app.use(cookieParser());
const csrfProtection = csrf({ cookie: true });

// تطبيق CSRF على جميع POST/PUT/DELETE routes
app.use('/api/*', (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return csrfProtection(req, res, next);
  }
  next();
});
```

---

### 5. ⚠️ تحسين Error Messages
**الملفات:** جميع `routes/*.js`

**تغيير من:**
```javascript
res.status(500).json({
  success: false,
  message: 'خطأ في إنشاء المراجعة',
  error: error.message  // ❌ تسريب معلومات
});
```

**إلى:**
```javascript
const isDevelopment = process.env.NODE_ENV !== 'production';
res.status(500).json({
  success: false,
  message: 'خطأ في إنشاء المراجعة',
  error: isDevelopment ? error.message : undefined  // ✅ آمن
});
```

---

### 6. ⚠️ إضافة Security Logging
**إنشاء ملف:** `utils/securityLogger.js`

```javascript
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function logSecurityEvent(type, details) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type,
    details,
    ip: details.ip || 'unknown',
    userAgent: details.userAgent || 'unknown'
  };
  
  const logFile = path.join(logDir, `security-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}

module.exports = { logSecurityEvent };
```

**استخدام في `routes/adminAuth.js`:**
```javascript
const { logSecurityEvent } = require('../utils/securityLogger');

router.post('/login', async (req, res) => {
  // ... الكود الحالي ...
  
  if (!isPasswordValid) {
    logSecurityEvent('failed_login', {
      email: email,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    return res.status(401).json({ ... });
  }
  
  logSecurityEvent('successful_login', {
    email: email,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  // ... باقي الكود ...
});
```

---

### 7. ⚠️ إضافة HTTPS Enforcement
**الملف:** `server.js`

**إضافة middleware:**
```javascript
// Force HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});
```

---

## 📝 ملف .env المطلوب

**إنشاء ملف `.env` في جذر المشروع:**

```env
# Server Configuration
PORT=8093
NODE_ENV=production

# JWT Secret (استخدم: openssl rand -base64 32)
JWT_SECRET=your-strong-random-secret-key-here

# Admin Credentials
ADMIN_EMAIL=admin@reviewqeem.com
ADMIN_PASSWORD=your-strong-admin-password-here

# Encryption Key (استخدم: openssl rand -hex 32)
ENCRYPTION_KEY=your-32-byte-hex-encryption-key-here

# CORS Allowed Origins (مفصولة بفواصل)
ALLOWED_ORIGINS=http://localhost:8093,https://yourdomain.com

# Supabase (اختياري)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_BUCKET=game_reviews

# Site URL
SITE_URL=https://yourdomain.com
```

---

## 🔒 ملخص الإصلاحات

### ✅ تم إصلاحه:
1. ✅ مشكلة فتح المراجعات
2. ✅ Hardcoded secrets
3. ✅ Rate limiting
4. ✅ CSP configuration
5. ✅ JWT token handling

### ⚠️ يحتاج إصلاح يدوي:
1. ⚠️ CORS configuration
2. ⚠️ Input validation
3. ⚠️ File validation (magic bytes)
4. ⚠️ CSRF protection
5. ⚠️ Error messages
6. ⚠️ Security logging
7. ⚠️ HTTPS enforcement

---

**ملاحظة:** بعض الإصلاحات تحتاج إلى تثبيت مكتبات إضافية. راجع قسم "إضافة مكتبة" لكل إصلاح.
