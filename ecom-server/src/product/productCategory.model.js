const mongoose = require('mongoose');

const productCategorySchema = new mongoose.Schema({
  categoryName: String,
  description: {
    type: String,
    minlength: 3,
  },
  discount: {
    type: Number,
    minlength: 1,
    maxlength: 2,
  },
  image: [{                    
    type: String,
  }],
  created_on: { type: Date, default: Date.now },
  productTypes: [
    // categoryName: String,
    // productName: String,
    // productType: ,
    // productPrice: req.body.productPrice,
    // productQuantity: req.body.productQuantity,
    // productWeight: req.body.productWeight,
    // images: images 
  ],
});

module.exports = mongoose.model('ProductCategory', productCategorySchema);