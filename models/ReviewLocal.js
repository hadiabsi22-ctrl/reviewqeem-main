const LocalStorage = require('../storage/localStorage');
const crypto = require('crypto');

const storage = new LocalStorage('reviews');

class ReviewLocal {
  constructor(data) {
    this.data = data || {};
  }

  // Generate slug
  generateSlug() {
    if (this.data.slug) return;
    if (!this.data.title) return;
    
    this.data.slug = this.data.title
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Save review
  async save() {
    this.generateSlug();

    // هل هذا سجل جديد أم موجود مسبقاً؟
    const isNew = !this.data._id && !this.data.id;

    if (isNew) {
      this.data._id = crypto.randomBytes(16).toString('hex');
      this.data.id = this.data._id;
    }

    if (!this.data.createdAt) {
      this.data.createdAt = new Date().toISOString();
    }
    this.data.updatedAt = new Date().toISOString();

    if (isNew) {
      // أول مرة → إدخال جديد في التخزين المحلي
      return storage.insert(this.data);
    } else {
      // سجل موجود → تحديثه
      const id = this.data._id || this.data.id;
      return storage.update({ _id: id }, this.data);
    }
  }

  // Static methods
  static async find(query = {}) {
    // البيانات محفوظة مباشرة في المصفوفة (من storage.insert(this.data))
    // لذلك نبحث مباشرة في item
    const data = storage.find(query);
    return data.map(item => new ReviewLocal(item));
  }

  static async findOne(query) {
    // البيانات محفوظة مباشرة في المصفوفة (من storage.insert(this.data))
    // نبحث في جميع البيانات لأن query قد يكون _id أو id أو slug
    const allData = storage.find({});
    const found = allData.find(item => {
      // البحث في جميع المفاتيح المطلوبة
      return Object.keys(query).every(key => {
        const queryValue = query[key];
        // البحث في item مباشرة (البيانات محفوظة مباشرة)
        if (item[key] === queryValue) return true;
        // البحث في item.data إذا كان موجوداً (للتوافق مع البيانات القديمة)
        if (item.data && item.data[key] === queryValue) return true;
        return false;
      });
    });
    return found ? new ReviewLocal(found) : null;
  }

  static async countDocuments(query = {}) {
    return storage.count(query);
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    const review = await ReviewLocal.findOne({ _id: id });
    if (!review) return null;

    Object.assign(review.data, updateData);
    await review.save();
    
    if (options.new) {
      return review;
    }
    return review;
  }

  static async findByIdAndDelete(id) {
    const review = await ReviewLocal.findOne({ _id: id });
    if (!review) return null;

    storage.delete({ _id: id });
    return review;
  }

  // Aggregate (simple implementation)
  static async aggregate(pipeline) {
    let data = storage.find();
    
    // Apply pipeline operations
    for (const stage of pipeline) {
      if (stage.$match) {
        data = data.filter(item => {
          return Object.keys(stage.$match).every(key => {
            const value = stage.$match[key];
            if (typeof value === 'object' && value.$in) {
              return value.$in.includes(item[key]);
            }
            return item[key] === value;
          });
        });
      }
      
      if (stage.$group) {
        // Simple grouping implementation
        const grouped = {};
        data.forEach(item => {
          const groupKey = stage.$group._id;
          const key = typeof groupKey === 'string' ? item[groupKey] : groupKey;
          
          if (!grouped[key]) {
            grouped[key] = { _id: key };
            Object.keys(stage.$group).forEach(op => {
              if (op !== '_id') {
                const field = stage.$group[op];
                if (field.$sum) {
                  grouped[key][op] = 0;
                } else if (field.$avg) {
                  grouped[key][op] = { total: 0, count: 0 };
                } else if (field.$max || field.$min) {
                  grouped[key][op] = null;
                }
              }
            });
          }
          
          Object.keys(stage.$group).forEach(op => {
            if (op !== '_id') {
              const field = stage.$group[op];
              if (field.$sum) {
                grouped[key][op] += item[field.$sum.replace('$', '')] || 0;
              } else if (field.$avg) {
                const fieldName = field.$avg.replace('$', '');
                grouped[key][op].total += item[fieldName] || 0;
                grouped[key][op].count += 1;
              } else if (field.$max) {
                const fieldName = field.$max.replace('$', '');
                if (grouped[key][op] === null || item[fieldName] > grouped[key][op]) {
                  grouped[key][op] = item[fieldName];
                }
              } else if (field.$min) {
                const fieldName = field.$min.replace('$', '');
                if (grouped[key][op] === null || item[fieldName] < grouped[key][op]) {
                  grouped[key][op] = item[fieldName];
                }
              }
            }
          });
        });
        
        // Calculate averages
        Object.keys(grouped).forEach(key => {
          Object.keys(grouped[key]).forEach(op => {
            if (grouped[key][op] && typeof grouped[key][op] === 'object' && grouped[key][op].total !== undefined) {
              grouped[key][op] = grouped[key][op].count > 0 ? grouped[key][op].total / grouped[key][op].count : 0;
            }
          });
        });
        
        data = Object.values(grouped);
      }
      
      if (stage.$sort) {
        const sortKey = Object.keys(stage.$sort)[0];
        const sortOrder = stage.$sort[sortKey];
        data.sort((a, b) => {
          const aVal = a[sortKey] || 0;
          const bVal = b[sortKey] || 0;
          return sortOrder === 1 ? aVal - bVal : bVal - aVal;
        });
      }
      
      if (stage.$limit) {
        data = data.slice(0, stage.$limit);
      }
    }
    
    return data;
  }

  // Populate (simple implementation)
  populate(field) {
    // For local storage, we don't need populate
    return this;
  }

  // Getters
  get _id() { return this.data._id || this.data.id; }
  get id() { return this.data._id || this.data.id; }
  get title() { return this.data.title; }
  get gameName() { return this.data.gameName; }
  get slug() { return this.data.slug; }
  get content() { return this.data.content; }
  get coverImage() { return this.data.coverImage; }
  get rating() { return this.data.rating; }
  get status() { return this.data.status; }
  get views() { return this.data.views || 0; }
  set views(value) { this.data.views = value; }
  
  // Convert to plain object
  toObject() {
    return { ...this.data };
  }
}

module.exports = ReviewLocal;
