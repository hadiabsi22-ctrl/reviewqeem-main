const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  coverImage: {
    type: String,
    default: ''
  },
  screenshots: [{
    type: String
  }],
  platforms: [{
    type: String
  }],
  genre: {
    type: String,
    trim: true
  },
  developer: {
    type: String,
    trim: true
  },
  publisher: {
    type: String,
    trim: true
  },
  releaseDate: {
    type: Date
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  officialWebsite: {
    type: String,
    default: ''
  },
  steamLink: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate slug before saving
gameSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  this.updatedAt = Date.now();
  next();
});

gameSchema.index({ slug: 1 });
gameSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Game', gameSchema);
