const express = require('express');
const router = express.Router();
const homeController = require('./home.controller');

// Homepage data endpoints
router.get('/data', homeController.getHomepageData);
router.get('/products/category/:category', homeController.getProductsByCategory);
router.get('/deals', homeController.getDealProducts);

module.exports = router;
