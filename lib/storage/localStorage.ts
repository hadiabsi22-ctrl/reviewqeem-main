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
  read(): any[] {
    try {
      if (fs.existsSync(this.encryptedPath)) {
        const encrypted = fs.readFileSync(this.encryptedPath, 'utf8');
        if (!encrypted || encrypted.trim() === '') {
          return [];
        }
        const decrypted = decrypt(encrypted);
        return JSON.parse(decrypted);
      } else if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf8');
        if (!data || data.trim() === '') {
          return [];
        }
        return JSON.parse(data);
      }
      return [];
    } catch (error: any) {
      // If decryption fails, return empty array (new file)
      if (error.message?.includes('bad decrypt') || error.message?.includes('decrypt')) {
        console.log(`⚠️  ملف ${this.fileName} جديد أو تالف، سيتم إنشاء ملف جديد`);
        return [];
      }
      console.error('Error reading storage:', error.message);
      return [];
    }
  }

  // Write data (encrypted)
  write(data: any[]): boolean {
    try {
      const json = JSON.stringify(data, null, 2);
      const encrypted = encrypt(json);
      fs.writeFileSync(this.encryptedPath, encrypted, 'utf8');
      return true;
    } catch (error) {
      console.error('Error writing storage:', error);
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
    const data = this.read();
    if (!Array.isArray(data)) {
      return this.write([item]);
    }
    data.push(item);
    return this.write(data);
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
