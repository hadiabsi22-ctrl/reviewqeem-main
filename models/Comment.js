const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
    required: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'reported'],
    default: 'pending'
  },
  featured: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0
  },
  reports: [{
    reason: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
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

commentSchema.index({ reviewId: 1 });
commentSchema.index({ status: 1 });
commentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
