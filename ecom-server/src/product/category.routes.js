const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller');

// Category Routes

// Create new category
router.post('/', categoryController.upload.single('image'), categoryController.createCategory);

// Get all categories
router.get('/', categoryController.getAllCategories);

// Get categories tree structure
router.get('/tree', categoryController.getCategoriesTree);

// Get category by slug
router.get('/slug/:slug', categoryController.getCategoryBySlug);

// Get subcategories by parent ID
router.get('/:parentId/subcategories', categoryController.getSubcategories);

// Get category by ID
router.get('/:id', categoryController.getCategoryById);

// Update category
router.put('/:id', categoryController.upload.single('image'), categoryController.updateCategory);

// Reorder categories
router.patch('/reorder', categoryController.reorderCategories);

// Delete category
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
