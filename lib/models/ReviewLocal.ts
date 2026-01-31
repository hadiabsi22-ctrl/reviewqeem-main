// ==================== ReviewLocal Model (TypeScript) ====================

import { Review } from '@/types';
import LocalStorage from '../storage/localStorage';
import * as crypto from 'crypto';

const storage = new LocalStorage('reviews');

export class ReviewLocal {
  private data: Review;

  constructor(data: Partial<Review> = {}) {
    this.data = {
      _id: data._id || data.id,
      id: data.id || data._id,
      title: data.title || '',
      slug: data.slug || '',
      gameTitle: data.gameTitle || '',
      gameSlug: data.gameSlug || '',
      coverImage: data.coverImage,
      screenshots: data.screenshots || [],
      content: data.content || '',
      summary: data.summary || '',
      rating: data.rating || 0,
      category: data.category || '',
      tags: data.tags || [],
      releaseDate: data.releaseDate,
      pros: data.pros || [],
      cons: data.cons || [],
      status: data.status || 'draft',
      featured: data.featured || false,
      views: data.views || 0,
      likes: data.likes || 0,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      author: data.author,
    };
  }

  // Generate slug
  private generateSlug(): void {
    if (this.data.slug) return;
    if (!this.data.title) return;

    this.data.slug = this.data.title
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Save review
  async save(): Promise<boolean> {
    this.generateSlug();

    // هل هذا سجل جديد أم موجود مسبقاً؟
    const isNew = !this.data._id && !this.data.id;

    console.log('💾 Saving review:', {
      isNew,
      id: this.data._id || this.data.id,
      title: this.data.title,
      status: this.data.status,
    });

    if (isNew) {
      const id = crypto.randomBytes(16).toString('hex');
      this.data._id = id;
      this.data.id = id;
      console.log('🆕 New review, generated ID:', id);
    }

    if (!this.data.createdAt) {
      this.data.createdAt = new Date().toISOString();
    }
    this.data.updatedAt = new Date().toISOString();

    let result: boolean;
    if (isNew) {
      // أول مرة → إدخال جديد في التخزين المحلي
      result = storage.insert(this.data);
      console.log('📝 Insert result:', result);
    } else {
      // سجل موجود → تحديثه
      const id = this.data._id || this.data.id;
      result = storage.update({ _id: id }, this.data);
      console.log('🔄 Update result:', result);
    }

    // التحقق من أن البيانات تم حفظها
    const allData = storage.read();
    console.log('📊 Total reviews in storage:', allData.length);
    if (allData.length > 0) {
      const lastReview = allData[allData.length - 1];
      console.log('📋 Last review in storage:', {
        title: lastReview.title,
        status: lastReview.status,
        id: lastReview._id || lastReview.id,
      });
    }

    return result;
  }

  // Static methods
  static async find(query: Partial<Review> = {}): Promise<ReviewLocal[]> {
    const data = storage.find(query);
    return data.map((item: Review) => new ReviewLocal(item));
  }

  static async findOne(query: Partial<Review>): Promise<ReviewLocal | null> {
    const data = storage.findOne(query);
    return data ? new ReviewLocal(data) : null;
  }

  static async findById(id: string): Promise<ReviewLocal | null> {
    return ReviewLocal.findOne({ _id: id });
  }

  static async findBySlug(slug: string): Promise<ReviewLocal | null> {
    return ReviewLocal.findOne({ slug });
  }

  static async findByIdAndUpdate(
    id: string,
    updateData: Partial<Review>
  ): Promise<ReviewLocal | null> {
    const review = await ReviewLocal.findOne({ _id: id });
    if (!review) return null;

    Object.assign(review.data, updateData);
    await review.save();
    return review;
  }

  static async findByIdAndDelete(id: string): Promise<ReviewLocal | null> {
    const review = await ReviewLocal.findOne({ _id: id });
    if (!review) return null;

    storage.delete({ _id: id });
    return review;
  }

  static async countDocuments(query: Partial<Review> = {}): Promise<number> {
    return storage.count(query);
  }

  get _id(): string | undefined {
    return this.data._id || this.data.id;
  }

  get id(): string | undefined {
    return this.data.id || this.data._id;
  }

  toObject(): Review {
    return { ...this.data };
  }
}
