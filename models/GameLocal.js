const LocalStorage = require('../storage/localStorage');
const crypto = require('crypto');

const storage = new LocalStorage('games');

class GameLocal {
  constructor(data) {
    this.data = data || {};
  }

  generateSlug() {
    if (this.data.slug) return;
    if (!this.data.name) return;
    
    this.data.slug = this.data.name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async save() {
    this.generateSlug();
    
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
    return data.map(item => new GameLocal(item));
  }

  static async findOne(query) {
    const data = storage.findOne(query);
    return data ? new GameLocal(data) : null;
  }

  static async countDocuments(query = {}) {
    return storage.count(query);
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    const game = await GameLocal.findOne({ _id: id });
    if (!game) return null;

    Object.assign(game.data, updateData);
    await game.save();
    
    if (options.new) {
      return game;
    }
    return game;
  }

  static async findByIdAndDelete(id) {
    const game = await GameLocal.findOne({ _id: id });
    if (!game) return null;

    storage.delete({ _id: id });
    return game;
  }

  get _id() { return this.data._id || this.data.id; }
  get id() { return this.data._id || this.data.id; }
  get name() { return this.data.name; }
  get slug() { return this.data.slug; }
  
  toObject() {
    return { ...this.data };
  }
}

module.exports = GameLocal;
