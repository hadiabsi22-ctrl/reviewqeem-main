const jwt = require('jsonwebtoken');
const AdminLocal = require('../models/AdminLocal');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
  console.error('❌ خطأ أمني: يجب تعيين JWT_SECRET قوي في ملف .env');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production');
  }
}

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    // JWT token من Authorization header فقط (لأمان أفضل)
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;
    
    // لا نقبل token من query parameters (لأمان أفضل)
    // ولا من cookies (نستخدم localStorage في الواجهة)

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'لم يتم توفير رمز المصادقة'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await AdminLocal.findOne({ _id: decoded.id });

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير موجود أو غير نشط'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'رمز المصادقة غير صالح'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'انتهت صلاحية رمز المصادقة'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من المصادقة'
    });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(403).json({
      success: false,
      message: 'غير مصرح بالوصول'
    });
  }
  next();
};

module.exports = { authenticate, isAdmin };
