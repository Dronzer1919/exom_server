const mongoose = require('mongoose');

// Blog Schema for furniture blog section
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  author: {
    name: { type: String, required: true },
    email: { type: String },
    avatar: { type: String }
  },
  image: {
    url: { type: String, required: true },
    alt: { type: String, default: '' }
  },
  tags: [String],
  category: {
    type: String,
    enum: ['design', 'tips', 'trends', 'reviews', 'lifestyle'],
    default: 'design'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  featured: { type: Boolean, default: false },
  seo: {
    metaTitle: String,
    metaDescription: String,
    slug: { type: String, unique: true }
  },
  publishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for better performance
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ featured: 1, status: 1 });
blogSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('Blog', blogSchema);
