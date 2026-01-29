const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { fileTypeFromBuffer } = require('file-type');
const { createClient } = require('@supabase/supabase-js');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Supabase configuration (اختياري - يجب تعيينها في .env)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'game_reviews';

// يمكن إعادة استخدام Supabase لاحقاً إن احتجنا، لكن حالياً نرفع محلياً فقط
// إنشاء Supabase client فقط إذا كانت البيانات متوفرة
let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

// Configure multer for memory storage (we'll upload directly to Supabase)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم. يُسمح فقط بصور JPEG, PNG, GIF, WebP'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter
});

// Single file upload (admin only) - نحفظ الصورة محلياً داخل مجلد /uploads
router.post('/single', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم رفع أي ملف'
      });
    }
    
    // فحص magic bytes للتأكد من نوع الملف الفعلي
    try {
      const fileType = await fileTypeFromBuffer(req.file.buffer);
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      if (!fileType || !allowedMimes.includes(fileType.mime)) {
        return res.status(400).json({
          success: false,
          message: 'نوع الملف غير صالح. يُسمح فقط بصور JPEG, PNG, GIF, WebP'
        });
      }
    } catch (fileTypeError) {
      console.error('خطأ في فحص نوع الملف:', fileTypeError);
      return res.status(400).json({
        success: false,
        message: 'لا يمكن التحقق من نوع الملف'
      });
    }

    // Generate safe ASCII filename (نتجنب الأحرف العربية في اسم الملف)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname || '').toLowerCase() || '.jpg';
    // نزيل كل الأحرف غير الإنجليزية والأرقام والشرطات والنقاط
    let base = path
      .basename(req.file.originalname || 'image', ext)
      .toLowerCase()
      .replace(/[^a-z0-9\-_.]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!base) base = 'image';
    const fileName = `${base}-${uniqueSuffix}${ext}`;

    // حفظ الصورة على القرص داخل مجلد /uploads/covers
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'covers');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, fileName);
    await fs.promises.writeFile(filePath, req.file.buffer);

    // رابط نسبي داخل الموقع (يتم خدمته من server.js عبر app.use('/uploads', express.static(...)))
    const publicUrl = `/uploads/covers/${fileName}`;

    res.json({
      success: true,
      message: 'تم رفع الصورة بنجاح',
      url: publicUrl,
      filename: fileName,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في رفع الملف',
      error: error.message
    });
  }
});

// Multiple files upload (admin only) - حفظ محلي للقطات الشاشة داخل /uploads/screenshots
router.post('/multiple', authenticate, isAdmin, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم رفع أي ملفات'
      });
    }

    const uploadedFiles = [];

    // مجلد حفظ لقطات الشاشة
    const screenshotsDir = path.join(__dirname, '..', 'uploads', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // حفظ كل ملف محلياً
    for (const file of req.files) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
      let base = path
        .basename(file.originalname || 'image', ext)
        .toLowerCase()
        .replace(/[^a-z0-9\-_.]+/g, '-')
        .replace(/^-+|-+$/g, '');
      if (!base) base = 'image';
      const fileName = `${base}-${uniqueSuffix}${ext}`;

      const filePath = path.join(screenshotsDir, fileName);

      try {
        await fs.promises.writeFile(filePath, file.buffer);

        const publicUrl = `/uploads/screenshots/${fileName}`;

        uploadedFiles.push({
          url: publicUrl,
          filename: fileName,
          size: file.size
        });
      } catch (error) {
        console.error('Local upload error (screenshot):', error);
        continue; // نتجاوز هذه الصورة ونكمل الباقي
      }
    }

    if (uploadedFiles.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'فشل رفع جميع الملفات'
      });
    }

    res.json({
      success: true,
      message: `تم رفع ${uploadedFiles.length} صورة بنجاح`,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في رفع الملفات',
      error: error.message
    });
  }
});

// Delete file (admin only) - Using Supabase Storage
router.delete('/:filename', authenticate, isAdmin, async (req, res) => {
  try {
    const { filename } = req.params;

    // Delete from local storage (نحذف محلياً)
    const filePath = path.join(__dirname, '..', 'uploads', 'covers', filename);
    const screenshotPath = path.join(__dirname, '..', 'uploads', 'screenshots', filename);
    
    // حذف من covers أو screenshots
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else if (fs.existsSync(screenshotPath)) {
      fs.unlinkSync(screenshotPath);
    } else {
      return res.status(404).json({
        success: false,
        message: 'الملف غير موجود'
      });
    }
    
    // إذا كان Supabase متوفراً، نحذف منه أيضاً
    if (supabase && SUPABASE_BUCKET) {
      try {
        await supabase.storage.from(SUPABASE_BUCKET).remove([filename]);
      } catch (supabaseError) {
        console.warn('⚠️  تحذير: فشل حذف الملف من Supabase:', supabaseError.message);
      }
    }

    if (error) {
      console.error('Supabase delete error:', error);
      return res.status(500).json({
        success: false,
        message: 'خطأ في حذف الملف من Supabase',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'تم حذف الملف بنجاح'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الملف',
      error: error.message
    });
  }
});

module.exports = router;
