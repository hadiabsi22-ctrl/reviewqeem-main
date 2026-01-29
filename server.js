const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8093;

// ==================== CORS Configuration ====================
app.options('*', cors());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || 
        origin.startsWith('http://localhost:') || 
        origin.startsWith('http://127.0.0.1:') ||
        origin.startsWith('file://')) {
      return callback(null, true);
    }
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// إضافة headers يدوياً
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// ==================== Helmet Configuration ====================
// تفعيل CSP بشكل صحيح للأمان

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: isDevelopment ? false : {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.quilljs.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.quilljs.com"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "data:", "https://cdn.quilljs.com"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: isDevelopment ? [] : []
      }
    },
    hidePoweredBy: true, // إخفاء X-Powered-By header
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    }
  })
);

// ==================== Cookie Parser ====================
app.use(cookieParser());

// ==================== CSRF Protection ====================
// CSRF protection بسيط - التحقق من Origin header
app.use('/api/*', (req, res, next) => {
  // السماح بـ GET و OPTIONS و HEAD بدون CSRF
  if (['GET', 'OPTIONS', 'HEAD'].includes(req.method)) {
    return next();
  }
  
  // في التطوير، نعطل CSRF لتسهيل الاختبار
  if (isDevelopment) {
    return next();
  }
  
  // في الإنتاج، التحقق من Origin header
  const origin = req.headers.origin || req.headers.referer;
  if (origin) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : [];
    
    const originUrl = new URL(origin);
    const isAllowed = allowedOrigins.some(allowed => {
      try {
        const allowedUrl = new URL(allowed);
        return originUrl.origin === allowedUrl.origin;
      } catch {
        return false;
      }
    });
    
    if (!isAllowed) {
      console.warn(`⚠️  CSRF blocked request from: ${origin}`);
      return res.status(403).json({
        success: false,
        message: 'طلب غير مصرح به'
      });
    }
  }
  
  next();
});

// ==================== Body Parsing ====================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==================== Rate Limiting ====================
// Rate limiting آمن - حدود مختلفة حسب نوع الطلب
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 100 في الإنتاج، 1000 في التطوير
  message: 'تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة لاحقاً.',
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 محاولات فقط لتسجيل الدخول
  message: 'تم تجاوز عدد محاولات تسجيل الدخول. يرجى المحاولة بعد 15 دقيقة.',
  skipSuccessfulRequests: true
});

app.use('/api/', generalLimiter);
app.use('/api/admin/auth/login', authLimiter);

// ==================== Static Files ====================
// خدمة ملفات الرفع مع caching headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1y', // Cache images for 1 year
  etag: true,
  lastModified: true
}));

// Serve static files with caching
app.use(express.static(__dirname, {
  maxAge: '7d', // Cache HTML/CSS/JS for 7 days
  etag: true,
  lastModified: true
}));

// ==================== Local Storage Initialization ====================
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ تم إنشاء مجلد التخزين المحلي');
}
console.log('✅ نظام التخزين المحلي المشفر جاهز');

// ==================== Initialize Admin ====================
(async () => {
  try {
    const AdminLocal = require('./models/AdminLocal');
    const adminCount = await AdminLocal.countDocuments();
    if (adminCount === 0) {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      if (!adminEmail || !adminPassword) {
        console.error('❌ خطأ: يجب تعيين ADMIN_EMAIL و ADMIN_PASSWORD في ملف .env');
        console.error('⚠️  لن يتم إنشاء حساب الأدمن الافتراضي');
        return;
      }
      
      if (adminPassword.length < 12) {
        console.error('❌ خطأ: كلمة مرور الأدمن يجب أن تكون 12 حرف على الأقل');
        return;
      }
      const defaultAdmin = new AdminLocal({
        email: adminEmail,
        password: adminPassword,
        name: 'مدير النظام',
        role: 'super_admin',
        isActive: true
      });
      await defaultAdmin.save();
      console.log('✅ تم إنشاء حساب الأدمن الافتراضي');
      console.log('📧 البريد:', adminEmail);
    } else {
      console.log('✅ حساب الأدمن موجود بالفعل');
    }
  } catch (error) {
    console.error('⚠️  خطأ في تهيئة الأدمن:', error.message);
  }
})();

// ==================== API Routes ====================
app.use('/api/admin/auth', require('./routes/adminAuth'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/games', require('./routes/games'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/comments-admin', require('./routes/commentsAdmin'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/stats', require('./routes/stats'));

// ==================== Health Check ====================
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'ReviewQeem API is running',
    timestamp: new Date().toISOString()
  });
});

// ==================== SEO Files ====================
// Serve robots.txt
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'robots.txt'));
});

// Generate and serve sitemap.xml
app.get('/sitemap.xml', async (req, res) => {
  try {
    const { generateSitemap } = require('./utils/generateSitemap');
    const sitemap = await generateSitemap();
    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('❌ خطأ في توليد sitemap.xml:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// ==================== Serve Frontend HTML Pages ====================
// يجب أن تكون قبل express.static لتأخذ الأولوية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/reviews-list.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'reviews-list.html'));
});

app.get('/review-view.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'review-view.html'));
});

// Clean URL support for reviews (SEO-friendly)
app.get('/review/:slug', (req, res) => {
  res.sendFile(path.join(__dirname, 'review-view.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/review-management.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'review-management.html'));
});

app.get('/comments-admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'comments-admin.html'));
});

app.get('/stats.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'stats.html'));
});

app.get('/settings.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'settings.html'));
});

app.get('/about-us.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'about-us.html'));
});

app.get('/faq.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'faq.html'));
});

app.get('/contact.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

// ==================== Serve Static Files ====================
// خدمة الملفات الثابتة (CSS, JS, images) - بعد routes HTML
app.use(express.static(path.join(__dirname), {
  dotfiles: 'ignore',
  index: false
}));

// ==================== Error Handling ====================
app.use((err, req, res, next) => {
  console.error('❌ خطأ في السيرفر:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'خطأ داخلي في السيرفر',
    error: isDevelopment ? err.stack : undefined // إخفاء تفاصيل الخطأ في الإنتاج
  });
});

// ==================== 404 Handler ====================
// للـ API routes فقط
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'المسار غير موجود'
  });
});

// للملفات الثابتة - إرجاع index.html
app.use((req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    res.status(404).send('Not Found');
  }
});

// ==================== Start Server ====================
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(60));
  console.log(`🚀 السيرفر يعمل على المنفذ ${PORT}`);
  console.log('='.repeat(60));
  console.log(`📡 API: http://127.0.0.1:${PORT}/api`);
  console.log(`🔗 Health: http://127.0.0.1:${PORT}/api/health`);
  console.log(`🌐 الموقع: http://127.0.0.1:${PORT}`);
  console.log(`📄 الرئيسية: http://127.0.0.1:${PORT}/index.html`);
  console.log(`📄 المراجعات: http://127.0.0.1:${PORT}/reviews-list.html`);
  console.log(`📄 لوحة التحكم: http://127.0.0.1:${PORT}/admin.html`);
  console.log('='.repeat(60) + '\n');
});

module.exports = app;
