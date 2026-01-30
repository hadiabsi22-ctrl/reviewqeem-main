// ==================== AdminLocal Model (TypeScript) ====================

import { Admin } from '@/types';
import LocalStorage from '../storage/localStorage';
import * as crypto from 'crypto';
import bcrypt from 'bcryptjs';

const storage = new LocalStorage('admins');

export class AdminLocal {
  private data: Admin;

  constructor(data: Partial<Admin> = {}) {
    this.data = {
      _id: data._id || data.id,
      id: data.id || data._id,
      username: data.username || '',
      email: data.email || '',
      password: data.password || '', // hashed
      role: data.role || 'admin',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
  }

  async save(): Promise<boolean> {
    const isNew = !this.data._id && !this.data.id;

    if (isNew) {
      const id = crypto.randomBytes(16).toString('hex');
      this.data._id = id;
      this.data.id = id;
    }

    if (!this.data.createdAt) {
      this.data.createdAt = new Date().toISOString();
    }
    this.data.updatedAt = new Date().toISOString();

    // Hash password if it's new or changed
    if (this.data.password && !this.data.password.startsWith('$2')) {
      this.data.password = await bcrypt.hash(this.data.password, 10);
    }

    if (isNew) {
      return await Promise.resolve(storage.insert(this.data));
    } else {
      const id = this.data._id || this.data.id;
      return await Promise.resolve(storage.update({ _id: id }, this.data));
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    if (!this.data.password) {
      return false;
    }
    return await bcrypt.compare(password, this.data.password);
  }

  static async find(query: Partial<Admin> = {}): Promise<AdminLocal[]> {
    const data = storage.find(query);
    return data.map((item: Admin) => new AdminLocal(item));
  }

  static async findOne(query: Partial<Admin>): Promise<AdminLocal | null> {
    const data = storage.findOne(query);
    return data ? new AdminLocal(data) : null;
  }

  static async findById(id: string): Promise<AdminLocal | null> {
    return AdminLocal.findOne({ _id: id });
  }

  static async findByEmail(email: string): Promise<AdminLocal | null> {
    return AdminLocal.findOne({ email: email.toLowerCase() });
  }

  static async countDocuments(query: Partial<Admin> = {}): Promise<number> {
    return storage.count(query);
  }

  get _id(): string | undefined {
    return this.data._id || this.data.id;
  }

  get id(): string | undefined {
    return this.data.id || this.data._id;
  }

  get email(): string {
    return this.data.email;
  }

  get username(): string {
    return this.data.username;
  }

  get role(): string {
    return this.data.role;
  }

  toObject(): Omit<Admin, 'password'> {
    const { password, ...rest } = this.data;
    return rest;
  }
}
