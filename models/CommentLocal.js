const LocalStorage = require('../storage/localStorage');
const crypto = require('crypto');

const storage = new LocalStorage('comments');

class CommentLocal {
  constructor(data) {
    this.data = data || {};
  }

  async save() {
    if (!this.data._id && !this.data.id) {
      this.data._id = crypto.randomBytes(16).toString('hex');
      this.data.id = this.data._id;
    }
    
    if (!this.data.createdAt) {
      this.data.createdAt = new Date().toISOString();
    }
    this.data.updatedAt = new Date().toISOString();
    
    if (this.data._id || this.data.id) {
      const id = this.data._id || this.data.id;
      return storage.update({ _id: id }, this.data);
    } else {
      return storage.insert(this.data);
    }
  }

  static async find(query = {}) {
    const data = storage.find(query);
    return data.map(item => new CommentLocal(item));
  }

  static async findOne(query) {
    const data = storage.findOne(query);
    return data ? new CommentLocal(data) : null;
  }

  static async countDocuments(query = {}) {
    return storage.count(query);
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    const comment = await CommentLocal.findOne({ _id: id });
    if (!comment) return null;

    Object.assign(comment.data, updateData);
    await comment.save();
    
    if (options.new) {
      return comment;
    }
    return comment;
  }

  static async findByIdAndDelete(id) {
    const comment = await CommentLocal.findOne({ _id: id });
    if (!comment) return null;

    storage.delete({ _id: id });
    return comment;
  }

  get _id() { return this.data._id || this.data.id; }
  get id() { return this.data._id || this.data.id; }
  get reviewId() { return this.data.reviewId; }
  get userName() { return this.data.userName; }
  get content() { return this.data.content; }
  get status() { return this.data.status || 'pending'; }
  get featured() { return this.data.featured || false; }
  set featured(value) { this.data.featured = value; }
  
  toObject() {
    return { ...this.data };
  }
}

module.exports = CommentLocal;
