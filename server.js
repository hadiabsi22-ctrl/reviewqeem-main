const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// ==================== التعديل الجذري للإصلاح ====================
// تعريف NODE_ENV بشكل صارم
const NODE_ENV = process.env.NODE_ENV || 'production';

// تعريف isDevelopment بشكل بسيط يمنع ظهور ReferenceError
const isDevelopment = NODE_ENV !== 'production';
// ==========================================================

const app = express();
const PORT = process.env.PORT || 8093;

// ==================== CORS Configuration ====================
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:8093', 'http://127.0.0.1:8093', 'https://reviewqeem.online'];

app.use(cors({
  origin: function (origin, callback) {
    // السماح بطلبات بدون origin (مثل Postman أو mobile apps)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // السماح بالنطاقات المسموحة
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (isDevelopment && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
      // في التطوير، نسمح بـ localhost
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  maxAge: 86400
}));

// ==================== HTTPS Enforcement ====================
if (!isDevelopment) {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// ==================== Helmet Configuration ====================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, // تعطيله مؤقتاً لضمان عمل الواجهة
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==================== API Routes ====================
// ملاحظة: تأكد أن هذه الملفات موجودة فعلياً في مجلداتك
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
    isDevelopment: isDevelopment,
    timestamp: new Date().toISOString()
  });
});

// ==================== Static Files & SEO ====================
// خدمة ملفات الرفع (uploads) قبل express.static العام
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1y',
  etag: true,
  lastModified: true
}));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.use(express.static(path.join(__dirname), {
  dotfiles: 'ignore',
  index: false
}));

// ==================== Error Handling ====================
app.use((err, req, res, next) => {
  console.error('❌ خطأ في السيرفر:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'خطأ داخلي في السيرفر'
  });
});

// ==================== Start Server ====================
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 السيرفر يعمل على المنفذ ${PORT}`);
  });
}

module.exports = app;
