const express = require('express');
const jwt = require('jsonwebtoken');
const AdminLocal = require('../models/AdminLocal');
const { authenticate } = require('../middleware/auth');
const { logFailedLogin, logSuccessfulLogin } = require('../utils/securityLogger');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ خطأ أمني: يجب تعيين JWT_SECRET في ملف .env');
}

// Initialize default admin if not exists
const initializeAdmin = async () => {
  try {
    const adminCount = await AdminLocal.countDocuments();
    if (adminCount === 0) {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      if (!adminEmail || !adminPassword) {
        console.error('❌ خطأ: يجب تعيين ADMIN_EMAIL و ADMIN_PASSWORD في ملف .env');
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
};

// Initialize on startup (with delay to ensure storage is ready)
setTimeout(() => {
  initializeAdmin();
}, 1000);

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني وكلمة المرور مطلوبان'
      });
    }

    const admin = await AdminLocal.findOne({ email: email.toLowerCase() });

    if (!admin || !admin.isActive) {
      logFailedLogin(email, req.ip, req.get('user-agent'));
      return res.status(401).json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }

    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      logFailedLogin(email, req.ip, req.get('user-agent'));
      return res.status(401).json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }
    
    // تسجيل تسجيل الدخول الناجح
    logSuccessfulLogin(email, req.ip, req.get('user-agent'));

    // Update last login
    admin.lastLogin = new Date().toISOString();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تسجيل الدخول'
    });
  }
});

// Verify token
router.get('/verify', authenticate, async (req, res) => {
  res.json({
    success: true,
    admin: {
      id: req.admin._id || req.admin.id,
      email: req.admin.email,
      name: req.admin.name,
      role: req.admin.role
    }
  });
});

// Change password
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الحالية والجديدة مطلوبتان'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'
      });
    }

    const admin = await AdminLocal.findOne({ _id: req.admin._id || req.admin.id });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // Verify current password
    const isPasswordValid = await admin.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'كلمة المرور الحالية غير صحيحة'
      });
    }

    // Update password
    admin.data.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تغيير كلمة المرور'
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'تم تسجيل الخروج بنجاح'
  });
});

module.exports = router;
