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
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 500
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
    ref: 'Category',
    required: true
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  brand: {
    type: String,
    trim: true
  },
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false }
  }],
  specifications: [{
    name: { type: String, required: true },
    value: { type: String, required: true },
    unit: String,
    category: String // Group specifications by category
  }],
  features: [String], // Key features/highlights
  technicalSpecs: [{
    category: String, // e.g., "Display", "Performance", "Connectivity"
    specs: [{
      name: String,
      value: String,
      unit: String
    }]
  }],
  badge: {
    type: String,
    enum: ['new', 'sale', 'hot', 'featured', 'limited', 'bestseller'],
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
      height: Number,
      unit: { type: String, default: 'cm' }
    },
    lowStockAlert: { type: Number, default: 5 }
  },
  variants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant'
  }],
  hasVariants: {
    type: Boolean,
    default: false
  },
  tags: [String],
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  crossSellProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  featured: { type: Boolean, default: false },
  topRated: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued', 'draft'],
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
productSchema.index({ category: 1, subcategory: 1, status: 1 });
productSchema.index({ featured: 1, status: 1 });
productSchema.index({ topRated: 1, status: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ price: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ tags: 1 });

// Virtual for variants
productSchema.virtual('productVariants', {
  ref: 'ProductVariant',
  localField: '_id',
  foreignField: 'product'
});

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.seo.slug = this.title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
