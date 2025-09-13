const express = require('express');
const router = express.Router();
const productController = require('./enhancedProduct.controller');

// Product Routes

// Create new product
router.post('/', productController.upload.array('images', 10), productController.createProduct);
router.post('/create', productController.upload.array('images', 10), productController.createProduct); // Alternative route for compatibility

// Search products
router.get('/search', productController.searchProducts);

// Get featured products
router.get('/featured', productController.getFeaturedProducts);

// Get top rated products
router.get('/top-rated', productController.getTopRatedProducts);

// Get all products with filtering
router.get('/', productController.getAllProducts);

// Get all products (explicit route to avoid ID conflict)
router.get('/all', productController.getAllProducts);

// Get products by category
router.get('/category/:categoryId', productController.getProductsByCategory);

// Get product by slug
router.get('/slug/:slug', productController.getProductBySlug);

// Get product by ID
router.get('/:id', productController.getProductById);

// Update product
router.put('/:id', productController.upload.array('images', 10), productController.updateProduct);

// Delete product
router.delete('/:id', productController.deleteProduct);

module.exports = router;
