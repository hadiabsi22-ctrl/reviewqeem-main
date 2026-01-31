// ==================== Test Password Script ====================

import { AdminLocal } from '../lib/models/AdminLocal';

async function testPassword() {
  const testPassword = 'ReviewQeem2026';
  
  console.log('🔐 اختبار كلمة المرور...\n');
  console.log(`كلمة المرور المختبرة: ${testPassword}\n`);

  try {
    const admins = await AdminLocal.find({});
    
    console.log(`📊 عدد الأدمن: ${admins.length}\n`);
    
    if (admins.length === 0) {
      console.log('❌ لا توجد حسابات أدمن في قاعدة البيانات');
      return;
    }

    for (const admin of admins) {
      console.log(`👤 الأدمن: ${admin.email || admin.username || 'unknown'}`);
      
      const hasPassword = (admin as any).data?.password || '';
      if (hasPassword) {
        console.log(`🔐 كلمة المرور المشفرة موجودة: نعم`);
        console.log(`🔐 بداية التشفير: ${hasPassword.substring(0, 30)}...`);
      } else {
        console.log(`❌ كلمة المرور المشفرة غير موجودة!`);
      }
      
      const isValid = await admin.comparePassword(testPassword);
      console.log(`🔑 نتيجة التحقق: ${isValid ? '✅ صحيحة' : '❌ خاطئة'}\n`);
    }
  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

testPassword();
