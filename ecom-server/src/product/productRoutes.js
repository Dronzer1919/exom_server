const express = require('express');
const router = express.Router();
const productController = require('./product.controller');
router.post('/create-products', productController.upload.any('image', 10), productController.createProduct);
router.post('/addtypes', productController.upload.any('image', 10), productController.addProductTypes);
router.get('/getAllProduct', productController.getAllProducts);
router.delete('/deleteProduct/:id', productController.deleteProduct);
router.put('/editProduct/:id', productController.upload.single('image'), productController.editProduct);

module.exports = router;
