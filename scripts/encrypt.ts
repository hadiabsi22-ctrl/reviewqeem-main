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
    let admins = await AdminLocal.find({});
    
    // إنشاء حساب أدمن افتراضي إذا لم يكن موجوداً
    if (admins.length === 0) {
      console.log('📝 إنشاء حساب أدمن افتراضي...');
      const defaultAdmin = new AdminLocal({
        username: 'admin',
        email: 'admin@reviewqeem.com',
        password: 'ReviewQeem2026', // سيتم تشفيرها تلقائياً
        role: 'admin',
      });
      await defaultAdmin.save();
      console.log('✅ تم إنشاء حساب الأدمن الافتراضي');
      admins = await AdminLocal.find({});
    }
    
    const adminStorage = new LocalStorage('admins');
    if (admins.length > 0) {
      // قراءة البيانات الكاملة من storage مباشرة
      const adminStorageRead = new LocalStorage('admins');
      const adminsRaw = adminStorageRead.read();
      
      if (adminsRaw.length > 0) {
        adminStorage.write(adminsRaw);
        console.log(`✅ تم إعادة تشفير ${adminsRaw.length} حساب أدمن`);
      } else {
        // إذا لم تكن البيانات موجودة، احفظ البيانات الجديدة
        const adminsData = await Promise.all(admins.map(async (a: any) => {
          // الحصول على البيانات الكاملة
          const adminData = (a as any).data || {};
          return {
            _id: adminData._id || adminData.id,
            id: adminData.id || adminData._id,
            username: adminData.username || 'admin',
            email: adminData.email || 'admin@reviewqeem.com',
            password: adminData.password || '', // password المشفر
            role: adminData.role || 'admin',
            createdAt: adminData.createdAt || new Date().toISOString(),
            updatedAt: adminData.updatedAt || new Date().toISOString(),
          };
        }));
        adminStorage.write(adminsData);
        console.log(`✅ تم إعادة تشفير ${adminsData.length} حساب أدمن`);
      }
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
