const express = require('express');
const router = express.Router();
const productController = require('./productController');

// Product CRUD operations
router.post('/create', productController.upload.array('images', 5), productController.createProduct);
router.get('/all', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/top-rated', productController.getTopRatedProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.upload.array('images', 5), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
