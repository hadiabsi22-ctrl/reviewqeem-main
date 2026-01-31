// ==================== LocalStorage (TypeScript) ====================

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const STORAGE_DIR = path.join(process.cwd(), 'data');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-cbc';

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Encryption functions
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
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
        if (!silent) console.log(`⚠️  ملف ${this.fileName} جديد أو تالف، سيتم إنشاء ملف جديد`);
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
          console.log(`💾 Writing ${data.length} items to ${this.fileName}`);
          const json = JSON.stringify(data, null, 2);
          const encrypted = encrypt(json);
          fs.writeFileSync(this.encryptedPath, encrypted, 'utf8');
          console.log(`✅ Successfully wrote ${data.length} items to ${this.encryptedPath}`);
          
      // التحقق من أن البيانات تم حفظها
      // إزالة console.log من read() لتجنب loop لا نهائي
      try {
        const encrypted = fs.readFileSync(this.encryptedPath, 'utf8');
        if (encrypted && encrypted.trim() !== '') {
          const decrypted = decrypt(encrypted);
          const parsed = JSON.parse(decrypted);
          console.log(`🔍 Verification: ${parsed.length} items read back`);
          if (parsed.length !== data.length) {
            console.error(`⚠️  Mismatch! Wrote ${data.length} but read ${parsed.length}`);
          }
        }
      } catch (verifyError: any) {
        console.error('⚠️  Verification failed:', verifyError.message);
      }
      
      return true;
        } catch (error: any) {
          console.error('❌ Error writing storage:', error);
          console.error('Error details:', error.message, error.stack);
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
