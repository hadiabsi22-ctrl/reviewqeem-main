const AdminLocal = require('./models/AdminLocal');
require('dotenv').config({ path: '.env.local' });

async function createAdmin() {
  try {
    console.log('🔄 جاري إنشاء حساب الأدمن...');
    
    // Check if admin exists
    const existing = await AdminLocal.findOne({ email: process.env.ADMIN_EMAIL || 'admin@reviewqeem.com' });
    
    if (existing) {
      console.log('⚠️  الحساب موجود بالفعل!');
      console.log('📧 البريد:', existing.email);
      
      // Update password
      existing.data.password = process.env.ADMIN_PASSWORD;
      await existing.save();
      console.log('✅ تم تحديث كلمة المرور');
    } else {
      const admin = new AdminLocal({
        email: process.env.ADMIN_EMAIL || 'admin@reviewqeem.com',
        password: process.env.ADMIN_PASSWORD || 'lwCiLYIduSXKNrZa8w5qzgTx9Daek7wWL14sDiPSS8Q=989143aa4862a0844afec2642248faa3<.]!@#$%',
        name: 'مدير النظام',
        role: 'super_admin',
        isActive: true
      });
      
      await admin.save();
      console.log('✅ تم إنشاء حساب الأدمن بنجاح!');
      console.log('📧 البريد:', admin.email);
      console.log('🔑 كلمة المرور: (من ملف .env.local)');
    }
    
    console.log('✅ تم!');
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

createAdmin();
