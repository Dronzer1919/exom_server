const express = require('express');
const router = express.Router();
const promoController = require('./promo.controller');

// Promo CRUD operations
router.post('/create', promoController.upload.single('image'), promoController.createPromo);
router.get('/all', promoController.getAllPromos);
router.get('/active', promoController.getActivePromos);
router.get('/:id', promoController.getPromoById);
router.put('/:id', promoController.upload.single('image'), promoController.updatePromo);
router.delete('/:id', promoController.deletePromo);

module.exports = router;
