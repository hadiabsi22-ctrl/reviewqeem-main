// ==================== Encrypt Data Script ====================

import LocalStorage from '../lib/storage/localStorage';
import { ReviewLocal } from '../lib/models/ReviewLocal';
import { AdminLocal } from '../lib/models/AdminLocal';

async function encryptData() {
  console.log('🔐 بدء عملية إعادة تشفير البيانات...\n');

  try {
    // إعادة تشفير المراجعات
    console.log('📝 معالجة المراجعات...');
    const reviews = await ReviewLocal.find({});
    const reviewStorage = new LocalStorage('reviews');
    
    if (reviews.length > 0) {
      const reviewsData = reviews.map((r: any) => {
        const obj = r.toObject();
        return obj;
      });
      reviewStorage.write(reviewsData);
      console.log(`✅ تم إعادة تشفير ${reviews.length} مراجعة`);
    } else {
      console.log('⚠️  لا توجد مراجعات لإعادة تشفيرها');
    }

    // إعادة تشفير الأدمن
    console.log('\n👤 معالجة حسابات الأدمن...');
    const adminStorage = new LocalStorage('admins');
    let adminsRaw = adminStorage.read();
    
    // إنشاء حساب أدمن افتراضي إذا لم يكن موجوداً
    if (adminsRaw.length === 0) {
      console.log('📝 إنشاء حساب أدمن افتراضي...');
      const defaultAdmin = new AdminLocal({
        username: 'admin',
        email: 'admin@reviewqeem.com',
        password: 'ReviewQeem2026', // سيتم تشفيرها تلقائياً
        role: 'admin',
      });
      await defaultAdmin.save();
      console.log('✅ تم إنشاء حساب الأدمن الافتراضي');
      // قراءة البيانات بعد الحفظ مباشرة
      adminsRaw = adminStorage.read();
    }
    
    if (adminsRaw.length > 0) {
      // إعادة كتابة البيانات المشفرة بالمفتاح الجديد
      adminStorage.write(adminsRaw);
      console.log(`✅ تم إعادة تشفير ${adminsRaw.length} حساب أدمن`);
      
      // التحقق من البيانات
      const testAdmin = adminsRaw[0];
      console.log(`📧 الإيميل: ${testAdmin.email}`);
      console.log(`🔐 كلمة المرور مشفرة: ${testAdmin.password ? 'نعم' : 'لا'}`);
    } else {
      console.log('⚠️  لا توجد حسابات أدمن لإعادة تشفيرها');
    }

    console.log('\n✨ تمت عملية إعادة التشفير بنجاح!');
  } catch (error: any) {
    console.error('❌ خطأ في عملية التشفير:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

encryptData();
