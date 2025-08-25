const mongoose = require('mongoose');

// Newsletter Subscription Schema
const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  isActive: { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now },
  unsubscribedAt: { type: Date },
  source: {
    type: String,
    enum: ['homepage', 'checkout', 'footer', 'popup'],
    default: 'homepage'
  }
}, {
  timestamps: true
});

// Index for better performance (only add if not exists)
newsletterSchema.index({ isActive: 1 });

module.exports = mongoose.model('Newsletter', newsletterSchema);
