const express = require('express');
const router = express.Router();
const newsletterController = require('./newsletter.controller');

// Newsletter operations
router.post('/subscribe', newsletterController.subscribe);
router.post('/unsubscribe', newsletterController.unsubscribe);
router.get('/subscribers', newsletterController.getAllSubscribers); // Admin only
router.get('/stats', newsletterController.getSubscriptionStats); // Admin only

module.exports = router;
