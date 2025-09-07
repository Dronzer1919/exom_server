const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productName: String,
  price: Number,
  originalPrice: Number,
  quantity: { type: Number, default: 1 },
  images: [String],
  category: String,
  description: String,
  weight: String,
  size: String,
  color: String,
  discount: Number,
  inStock: Boolean
}, { _id: false });

const CartSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  items: [CartItemSchema],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cart', CartSchema);
