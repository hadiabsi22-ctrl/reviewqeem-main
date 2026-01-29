const LocalStorage = require('../storage/localStorage');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const storage = new LocalStorage('admins');

class AdminLocal {
  constructor(data) {
    this.data = data || {};
  }

  // Save admin
  async save() {
    // Hash password if it's new or modified
    if (this.data.password && !this.data.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      this.data.password = await bcrypt.hash(this.data.password, salt);
    }

    if (this.data._id || this.data.id) {
      // Update existing
      const id = this.data._id || this.data.id;
      return storage.update({ _id: id }, this.data);
    } else {
      // Insert new
      return storage.insert(this.data);
    }
  }

  // Compare password
  async comparePassword(candidatePassword) {
    if (!this.data.password) return false;
    return await bcrypt.compare(candidatePassword, this.data.password);
  }

  // Static methods
  static async findOne(query) {
    const data = storage.findOne(query);
    return data ? new AdminLocal(data) : null;
  }

  static async find(query = {}) {
    const data = storage.find(query);
    return data.map(item => new AdminLocal(item));
  }

  static async countDocuments(query = {}) {
    return storage.count(query);
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    const admin = await AdminLocal.findOne({ _id: id });
    if (!admin) return null;

    Object.assign(admin.data, updateData);
    await admin.save();
    
    if (options.new) {
      return admin;
    }
    return admin;
  }

  static async findByIdAndDelete(id) {
    const admin = await AdminLocal.findOne({ _id: id });
    if (!admin) return null;

    storage.delete({ _id: id });
    return admin;
  }

  // Getter methods
  get _id() { return this.data._id || this.data.id; }
  get id() { return this.data._id || this.data.id; }
  get email() { return this.data.email; }
  get password() { return this.data.password; }
  get name() { return this.data.name; }
  get role() { return this.data.role; }
  get isActive() { return this.data.isActive !== false; }
  get lastLogin() { return this.data.lastLogin; }
  set lastLogin(value) { this.data.lastLogin = value; }

  // Select specific fields (for compatibility with Mongoose)
  select(fields) {
    const selected = {};
    const fieldList = fields.replace(/[+-]/g, '').split(/\s+/);
    
    fieldList.forEach(field => {
      if (this.data[field] !== undefined) {
        selected[field] = this.data[field];
      }
    });
    
    return selected;
  }
}

module.exports = AdminLocal;
