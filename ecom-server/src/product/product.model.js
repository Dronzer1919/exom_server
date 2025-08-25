const mongoose = require('mongoose');

// Product Schema for individual products
const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number, // For showing discounts
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory',
    required: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false }
  }],
  badge: {
    type: String,
    enum: ['new', 'sale', 'hot', 'featured', 'limited'],
    default: null
  },
  rating: {
    average: { type: Number, min: 0, max: 5, default: 0 },
    count: { type: Number, default: 0 }
  },
  inventory: {
    quantity: { type: Number, required: true, min: 0 },
    sku: { type: String, unique: true, sparse: true },
    weight: { type: Number }, // in kg
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    }
  },
  tags: [String],
  featured: { type: Boolean, default: false },
  topRated: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    slug: { type: String, unique: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for better performance
productSchema.index({ category: 1, status: 1 });
productSchema.index({ featured: 1, status: 1 });
productSchema.index({ topRated: 1, status: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
