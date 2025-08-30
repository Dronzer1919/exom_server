const mongoose = require('mongoose');

// Enhanced Promo Schema for comprehensive promotional campaigns
const promoSchema = new mongoose.Schema({
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
    trim: true
  },
  // Discount Configuration
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping', 'buy_one_get_one'],
    required: true
  },
  discountValue: {
    type: Number,
    min: 0,
    default: 0
  },
  // Promo Code
  code: {
    type: String,
    trim: true,
    uppercase: true,
    sparse: true, // Allow multiple null values but unique non-null values
    unique: true
  },
  // Order Requirements
  minOrderValue: {
    type: Number,
    min: 0,
    default: 0
  },
  // Legacy price fields (for backward compatibility)
  price: {
    type: Number,
    min: 0,
    default: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  // Image
  image: {
    url: { type: String },
    alt: { type: String, default: '' }
  },
  // Usage Limits
  usageLimit: {
    type: Number,
    min: 0,
    default: 0 // 0 means unlimited
  },
  usedCount: {
    type: Number,
    min: 0,
    default: 0
  },
  perUserLimit: {
    type: Number,
    min: 1,
    default: 1
  },
  // Timing
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  // Legacy timing fields (for backward compatibility)
  validFrom: { type: Date },
  validUntil: { type: Date },
  // Targeting
  targetAudience: {
    type: String,
    enum: ['all', 'new', 'returning', 'vip'],
    default: 'all'
  },
  // Settings
  featured: {
    type: Boolean,
    default: false
  },
  combinable: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  // Call to Action
  buttonText: {
    type: String,
    default: 'Shop Now'
  },
  buttonLink: {
    type: String,
    default: '#'
  },
  // Legacy fields (for backward compatibility)
  link: {
    type: String,
    default: '#'
  },
  type: {
    type: String,
    enum: ['collection', 'category', 'product', 'deal'],
    default: 'deal'
  },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Pre-save middleware to generate promo code if not provided
promoSchema.pre('save', function(next) {
  if (!this.code && this.discountType !== 'free_shipping') {
    // Generate a random 8-character code
    this.code = 'PROMO' + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  
  // Sync legacy fields for backward compatibility
  if (this.startDate && !this.validFrom) {
    this.validFrom = this.startDate;
  }
  if (this.endDate && !this.validUntil) {
    this.validUntil = this.endDate;
  }
  if (this.buttonLink && !this.link) {
    this.link = this.buttonLink;
  }
  if (this.status === 'active') {
    this.isActive = true;
  } else {
    this.isActive = false;
  }
  
  next();
});

// Index for better performance
promoSchema.index({ isActive: 1, displayOrder: 1 });
promoSchema.index({ type: 1, isActive: 1 });
promoSchema.index({ status: 1, startDate: 1, endDate: 1 });
promoSchema.index({ featured: 1, status: 1 });

module.exports = mongoose.model('Promo', promoSchema);
