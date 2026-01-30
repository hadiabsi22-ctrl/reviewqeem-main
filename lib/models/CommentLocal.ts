// ==================== CommentLocal Model (TypeScript) ====================

import { Comment } from '@/types';
import LocalStorage from '../storage/localStorage';
import crypto from 'crypto';

const storage = new LocalStorage('comments');

export class CommentLocal {
  private data: Comment;

  constructor(data: Partial<Comment> = {}) {
    this.data = {
      _id: data._id || data.id,
      id: data.id || data._id,
      reviewId: data.reviewId || '',
      userName: data.userName || '',
      userEmail: data.userEmail || '',
      content: data.content || '',
      rating: data.rating || 0,
      status: data.status || 'pending',
      likes: data.likes || 0,
      reports: data.reports || [],
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
    };
  }

  async save(): Promise<CommentLocal> {
    if (!this.data._id && !this.data.id) {
      const id = crypto.randomBytes(16).toString('hex');
      this.data._id = id;
      this.data.id = id;
    }

    if (!this.data.createdAt) {
      this.data.createdAt = new Date().toISOString();
    }
    this.data.updatedAt = new Date().toISOString();

    if (this.data._id || this.data.id) {
      const id = this.data._id || this.data.id;
      await storage.update({ _id: id }, this.data);
    } else {
      await storage.insert(this.data);
    }

    return this;
  }

  static async find(query: Partial<Comment> = {}): Promise<CommentLocal[]> {
    const data = storage.find(query);
    return data.map((item: Comment) => new CommentLocal(item));
  }

  static async findOne(query: Partial<Comment>): Promise<CommentLocal | null> {
    const data = storage.findOne(query);
    return data ? new CommentLocal(data) : null;
  }

  static async findById(id: string): Promise<CommentLocal | null> {
    return CommentLocal.findOne({ _id: id });
  }

  static async findByIdAndUpdate(
    id: string,
    updateData: Partial<Comment>,
    options: { new?: boolean } = {}
  ): Promise<CommentLocal | null> {
    const comment = await CommentLocal.findOne({ _id: id });
    if (!comment) return null;

    // Handle $inc operator
    if (updateData.likes !== undefined && '$inc' in updateData) {
      comment.data.likes = (comment.data.likes || 0) + 1;
    }

    // Handle $push operator
    if (updateData.reports && Array.isArray(updateData.reports)) {
      comment.data.reports = [...(comment.data.reports || []), ...updateData.reports];
    }

    // Merge other updates
    Object.assign(comment.data, updateData);
    await comment.save();

    return options.new ? comment : comment;
  }

  static async countDocuments(query: Partial<Comment> = {}): Promise<number> {
    return storage.count(query);
  }

  get _id(): string | undefined {
    return this.data._id || this.data.id;
  }

  get id(): string | undefined {
    return this.data.id || this.data._id;
  }

  toObject(): Comment {
    return { ...this.data };
  }
}
