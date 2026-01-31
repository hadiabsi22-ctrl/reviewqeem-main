// ==================== LocalStorage (TypeScript) ====================

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const STORAGE_DIR = path.join(process.cwd(), 'data');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-cbc';

// التحقق من ENCRYPTION_KEY عند تحميل الملف
if (process.env.ENCRYPTION_KEY) {
  const keyLength = process.env.ENCRYPTION_KEY.length;
  if (keyLength < 64) {
    console.warn(`⚠️  ENCRYPTION_KEY length is ${keyLength}, expected at least 64 hex characters (32 bytes)`);
  } else {
    console.log(`✅ ENCRYPTION_KEY loaded: ${keyLength} characters`);
  }
} else {
  console.warn('⚠️  ENCRYPTION_KEY not found in environment variables. Using random key (data will not be compatible with other instances).');
}

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Encryption functions
function encrypt(text: string): string {
  try {
    // التحقق من أن ENCRYPTION_KEY موجود وصحيح
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 64) {
      throw new Error('ENCRYPTION_KEY is missing or invalid. Must be at least 64 hex characters (32 bytes).');
    }
    
    const iv = crypto.randomBytes(16);
    const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
    
    if (keyBuffer.length !== 32) {
      throw new Error(`ENCRYPTION_KEY length is ${keyBuffer.length} bytes, expected 32 bytes (64 hex characters).`);
    }
    
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error: any) {
    console.error('❌ Encryption error:', error.message);
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

function decrypt(encryptedText: string): string {
  try {
    // التحقق من أن ENCRYPTION_KEY موجود وصحيح
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 64) {
      throw new Error('ENCRYPTION_KEY is missing or invalid. Must be at least 64 hex characters (32 bytes).');
    }
    
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
    
    if (keyBuffer.length !== 32) {
      throw new Error(`ENCRYPTION_KEY length is ${keyBuffer.length} bytes, expected 32 bytes (64 hex characters).`);
    }
    
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error: any) {
    console.error('❌ Decryption error:', error.message);
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

// Storage operations
export default class LocalStorage {
  private filePath: string;
  private encryptedPath: string;
  private fileName: string;

  constructor(fileName: string) {
    this.fileName = fileName;
    this.filePath = path.join(STORAGE_DIR, `${fileName}.json`);
    this.encryptedPath = path.join(STORAGE_DIR, `${fileName}.encrypted`);
  }

  // Read data
  read(silent: boolean = false): any[] {
    try {
      if (fs.existsSync(this.encryptedPath)) {
        const encrypted = fs.readFileSync(this.encryptedPath, 'utf8');
        if (!encrypted || encrypted.trim() === '') {
          if (!silent) console.log(`⚠️  ملف ${this.fileName}.encrypted فارغ`);
          return [];
        }
        const decrypted = decrypt(encrypted);
        const parsed = JSON.parse(decrypted);
        if (!silent) console.log(`📖 Read ${parsed.length} items from ${this.fileName}.encrypted`);
        return parsed;
      } else if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf8');
        if (!data || data.trim() === '') {
          if (!silent) console.log(`⚠️  ملف ${this.fileName}.json فارغ`);
          return [];
        }
        const parsed = JSON.parse(data);
        if (!silent) console.log(`📖 Read ${parsed.length} items from ${this.fileName}.json`);
        return parsed;
      }
      if (!silent) console.log(`📖 ملف ${this.fileName} غير موجود، إرجاع مصفوفة فارغة`);
      return [];
    } catch (error: any) {
      // If decryption fails, return empty array (new file)
      if (error.message?.includes('bad decrypt') || error.message?.includes('decrypt')) {
        if (!silent) {
          console.warn(`⚠️  ملف ${this.fileName} مشفر بمفتاح مختلف أو تالف`);
          console.warn(`⚠️  سيتم إنشاء ملف جديد. البيانات القديمة لن تكون متاحة.`);
          console.warn(`⚠️  تأكد من أن ENCRYPTION_KEY في Vercel يطابق المفتاح المحلي.`);
        }
        return [];
      }
      if (!silent) {
        console.error(`❌ Error reading storage ${this.fileName}:`, error.message);
        console.error('Error stack:', error.stack);
      }
      return [];
    }
  }

      // Write data (encrypted)
      write(data: any[]): boolean {
        try {
          // التحقق من ENCRYPTION_KEY قبل البدء
          if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 64) {
            console.error('❌ ENCRYPTION_KEY is missing or invalid!');
            console.error('❌ ENCRYPTION_KEY length:', ENCRYPTION_KEY?.length || 0);
            console.error('❌ Expected: 64 hex characters (32 bytes)');
            throw new Error('ENCRYPTION_KEY is missing or invalid');
          }
          
          console.log(`💾 Writing ${data.length} items to ${this.fileName}`);
          console.log(`🔑 ENCRYPTION_KEY length: ${ENCRYPTION_KEY.length} characters`);
          
          // تحويل البيانات إلى JSON
          const json = JSON.stringify(data, null, 2);
          console.log(`📄 JSON size: ${json.length} characters`);
          
          // تشفير البيانات
          let encrypted: string;
          try {
            encrypted = encrypt(json);
            console.log(`🔐 Encrypted size: ${encrypted.length} characters`);
          } catch (encryptError: any) {
            console.error('❌ Encryption failed:', encryptError.message);
            throw new Error(`Encryption failed: ${encryptError.message}`);
          }
          
          // كتابة الملف
          try {
            fs.writeFileSync(this.encryptedPath, encrypted, 'utf8');
            console.log(`✅ Successfully wrote ${data.length} items to ${this.encryptedPath}`);
          } catch (writeError: any) {
            console.error('❌ File write failed:', writeError.message);
            throw new Error(`File write failed: ${writeError.message}`);
          }
          
          // التحقق من أن البيانات تم حفظها (اختياري - لا يؤثر على النتيجة)
          try {
            const verifyEncrypted = fs.readFileSync(this.encryptedPath, 'utf8');
            if (verifyEncrypted && verifyEncrypted.trim() !== '') {
              const decrypted = decrypt(verifyEncrypted);
              const parsed = JSON.parse(decrypted);
              console.log(`🔍 Verification: ${parsed.length} items read back`);
              if (parsed.length !== data.length) {
                console.error(`⚠️  Mismatch! Wrote ${data.length} but read ${parsed.length}`);
                // لا نرمي خطأ هنا، فقط تحذير
              } else {
                console.log(`✅ Verification successful: ${parsed.length} items match`);
              }
            }
          } catch (verifyError: any) {
            // التحقق فشل، لكن الكتابة نجحت - نرجع true
            console.warn('⚠️  Verification failed (but write succeeded):', verifyError.message);
          }
          
          return true;
        } catch (error: any) {
          console.error('❌ Error writing storage:', error);
          console.error('❌ Error message:', error.message);
          console.error('❌ Error stack:', error.stack);
          console.error('❌ ENCRYPTION_KEY status:', ENCRYPTION_KEY ? `Present (${ENCRYPTION_KEY.length} chars)` : 'Missing');
          return false;
        }
      }

  // Find one
  findOne(query: Record<string, any>): any | null {
    const data = this.read();
    if (Array.isArray(data)) {
      return data.find((item) => {
        return Object.keys(query).every((key) => item[key] === query[key]);
      }) || null;
    }
    return null;
  }

  // Find all
  find(query: Record<string, any> = {}): any[] {
    const data = this.read();
    if (!Array.isArray(data)) return [];

    if (Object.keys(query).length === 0) {
      return data;
    }

    return data.filter((item) => {
      return Object.keys(query).every((key) => item[key] === query[key]);
    });
  }

      // Insert
      insert(item: any): boolean {
        console.log(`➕ Inserting item into ${this.fileName}:`, {
          id: item._id || item.id,
          title: item.title,
          status: item.status,
        });
        const data = this.read(true); // silent mode لتجنب logging مفرط
        console.log(`📊 Current data count: ${data.length}`);
        if (!Array.isArray(data)) {
          console.log('⚠️ Data is not array, creating new array');
          return this.write([item]);
        }
        data.push(item);
        console.log(`📊 New data count: ${data.length}`);
        const writeResult = this.write(data);
        if (writeResult) {
          console.log(`✅ Successfully inserted item with ID: ${item._id || item.id}`);
        } else {
          console.error(`❌ Failed to insert item with ID: ${item._id || item.id}`);
        }
        return writeResult;
      }

  // Update
  update(query: Record<string, any>, updateData: any): boolean {
    const data = this.read();
    if (!Array.isArray(data)) return false;

    const index = data.findIndex((item) => {
      return Object.keys(query).every((key) => item[key] === query[key]);
    });

    if (index === -1) return false;

    data[index] = { ...data[index], ...updateData };
    return this.write(data);
  }

  // Delete
  delete(query: Record<string, any>): boolean {
    const data = this.read();
    if (!Array.isArray(data)) return false;

    const filtered = data.filter((item) => {
      return !Object.keys(query).every((key) => item[key] === query[key]);
    });

    return this.write(filtered);
  }

  // Count
  count(query: Record<string, any> = {}): number {
    return this.find(query).length;
  }
}
