const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * تسجيل الأحداث الأمنية
 */
function logSecurityEvent(type, details) {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      details: {
        ...details,
        ip: details.ip || 'unknown',
        userAgent: details.userAgent || 'unknown'
      }
    };
    
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(logDir, `security-${today}.log`);
    
    // إضافة السجل إلى الملف
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n', 'utf8');
    
    // طباعة في console أيضاً
    console.log(`🔒 [SECURITY] ${type}:`, {
      timestamp: logEntry.timestamp,
      ip: logEntry.details.ip,
      ...(details.email && { email: details.email }),
      ...(details.reviewId && { reviewId: details.reviewId })
    });
  } catch (error) {
    console.error('❌ خطأ في تسجيل الحدث الأمني:', error.message);
  }
}

/**
 * تسجيل محاولة تسجيل دخول فاشلة
 */
function logFailedLogin(email, ip, userAgent) {
  logSecurityEvent('failed_login', {
    email,
    ip,
    userAgent
  });
}

/**
 * تسجيل تسجيل دخول ناجح
 */
function logSuccessfulLogin(email, ip, userAgent) {
  logSecurityEvent('successful_login', {
    email,
    ip,
    userAgent
  });
}

/**
 * تسجيل نشاط إداري
 */
function logAdminAction(action, adminId, details = {}) {
  logSecurityEvent('admin_action', {
    action,
    adminId,
    ...details
  });
}

/**
 * تسجيل محاولة وصول غير مصرح
 */
function logUnauthorizedAccess(ip, path, userAgent) {
  logSecurityEvent('unauthorized_access', {
    ip,
    path,
    userAgent
  });
}

module.exports = {
  logSecurityEvent,
  logFailedLogin,
  logSuccessfulLogin,
  logAdminAction,
  logUnauthorizedAccess
};
