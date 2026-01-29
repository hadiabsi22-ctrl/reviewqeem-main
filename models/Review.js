const mongoose = require('mongoose');

const platformSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  icon: String
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  gameName: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  summary: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    default: ''
  },
  mainImage: {
    type: String,
    default: ''
  },
  screenshots: [{
    type: String
  }],
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  platforms: [platformSchema],
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
  reviewDate: {
    type: Date,
    default: Date.now
  },
  pros: [{
    type: String
  }],
  cons: [{
    type: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  youtube: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
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
reviewSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  this.updatedAt = Date.now();
  next();
});

// Indexes for better performance
reviewSchema.index({ slug: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ gameName: 'text', title: 'text', content: 'text' });

module.exports = mongoose.model('Review', reviewSchema);
