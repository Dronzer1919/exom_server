const mongoose = require('mongoose');

// Promo/Collection Schema for featured collections and promo cards
const promoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  image: {
    url: { type: String, required: true },
    alt: { type: String, default: '' }
  },
  link: {
    type: String, // Link to category/product page
    required: true
  },
  type: {
    type: String,
    enum: ['collection', 'category', 'product', 'deal'],
    default: 'collection'
  },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for better performance
promoSchema.index({ isActive: 1, displayOrder: 1 });
promoSchema.index({ type: 1, isActive: 1 });

module.exports = mongoose.model('Promo', promoSchema);
