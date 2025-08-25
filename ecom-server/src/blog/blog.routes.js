const express = require('express');
const router = express.Router();
const blogController = require('./blog.controller');

// Blog CRUD operations
router.post('/create', blogController.upload.single('image'), blogController.createBlog);
router.get('/all', blogController.getAllBlogs);
router.get('/featured', blogController.getFeaturedBlogs);
router.get('/latest', blogController.getLatestBlogs);
router.get('/:id', blogController.getBlogById);
router.put('/:id', blogController.upload.single('image'), blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);

module.exports = router;
