const mongoose = require('mongoose');

// Product Variant Schema for different varieties of the same product
const productVariantSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    required: true
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
  inventory: {
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    lowStockAlert: {
      type: Number,
      default: 5
    }
  },
  attributes: [{
    name: {
      type: String,
      required: true // e.g., "Color", "Size", "Material"
    },
    value: {
      type: String,
      required: true // e.g., "Red", "Large", "Cotton"
    }
  }],
  specifications: [{
    name: String,
    value: String,
    unit: String // e.g., "cm", "kg", "ml"
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  weight: {
    type: Number // in kg
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      default: 'cm'
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
productVariantSchema.index({ product: 1, isActive: 1 });
// productVariantSchema.index({ sku: 1 }); // Removed - sku field already has unique: true which creates index
productVariantSchema.index({ 'attributes.name': 1, 'attributes.value': 1 });

module.exports = mongoose.model('ProductVariant', productVariantSchema);
