const express = require('express');
const router = express.Router();
const variantController = require('./productVariant.controller');

// Product Variant Routes

// Get all variants (must be before /:id route)
router.get('/all', variantController.getAllVariants);

// Create new variant for a product
router.post('/', variantController.upload.array('images', 10), variantController.createProductVariant);

// Get all variants for a specific product
router.get('/product/:productId', variantController.getProductVariants);

// Get unique attributes for a product (for filtering)
router.get('/product/:productId/attributes', variantController.getProductAttributes);

// Get variants by attributes (filtering)
router.get('/product/:productId/filter', variantController.getVariantsByAttributes);

// Get variant by ID
router.get('/:id', variantController.getVariantById);

// Update variant
router.put('/:id', variantController.upload.array('images', 10), variantController.updateProductVariant);

// Update variant inventory only
router.patch('/:id/inventory', variantController.updateVariantInventory);

// Delete variant
router.delete('/:id', variantController.deleteProductVariant);

module.exports = router;
