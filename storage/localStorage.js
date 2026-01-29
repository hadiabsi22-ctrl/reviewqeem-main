const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const STORAGE_DIR = path.join(__dirname, '../data');
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-cbc';

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Encryption functions
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText) {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Storage operations
class LocalStorage {
  constructor(fileName) {
    this.filePath = path.join(STORAGE_DIR, `${fileName}.json`);
    this.encryptedPath = path.join(STORAGE_DIR, `${fileName}.encrypted`);
  }

  // Read data
  read() {
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
    } catch (error) {
      // If decryption fails, return empty array (new file)
      if (error.message.includes('bad decrypt') || error.message.includes('decrypt')) {
        console.log(`⚠️  ملف ${this.fileName} جديد أو تالف، سيتم إنشاء ملف جديد`);
        return [];
      }
      console.error('Error reading storage:', error.message);
      return [];
    }
  }

  // Write data (encrypted)
  write(data) {
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
  findOne(query) {
    const data = this.read();
    if (Array.isArray(data)) {
      return data.find(item => {
        return Object.keys(query).every(key => item[key] === query[key]);
      });
    }
    return null;
  }

  // Find all
  find(query = {}) {
    const data = this.read();
    if (!Array.isArray(data)) return [];
    
    if (Object.keys(query).length === 0) {
      return data;
    }
    
    return data.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  // Insert
  insert(item) {
    const data = this.read();
    if (!Array.isArray(data)) {
      return this.write([item]);
    }
    
    // Generate ID if not exists
    if (!item.id && !item._id) {
      item.id = crypto.randomBytes(16).toString('hex');
      item._id = item.id;
    }
    
    // Add timestamps
    if (!item.createdAt) {
      item.createdAt = new Date().toISOString();
    }
    item.updatedAt = new Date().toISOString();
    
    data.push(item);
    return this.write(data);
  }

  // Update
  update(query, updateData) {
    const data = this.read();
    if (!Array.isArray(data)) return false;
    
    const index = data.findIndex(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
    
    if (index === -1) return false;
    
    data[index] = {
      ...data[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    return this.write(data);
  }

  // Delete
  delete(query) {
    const data = this.read();
    if (!Array.isArray(data)) return false;
    
    const filtered = data.filter(item => {
      return !Object.keys(query).every(key => item[key] === query[key]);
    });
    
    return this.write(filtered);
  }

  // Count
  count(query = {}) {
    const data = this.read();
    if (!Array.isArray(data)) return 0;
    
    if (Object.keys(query).length === 0) {
      return data.length;
    }
    
    return this.find(query).length;
  }
}

module.exports = LocalStorage;
