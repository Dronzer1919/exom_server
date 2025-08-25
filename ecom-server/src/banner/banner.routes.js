const express = require('express');
const router = express.Router();
const bannerController = require('./banner.controller');

// Create banner (upload)
router.post('/create-banner', bannerController.upload.single('banner'), bannerController.createBanner);

// Get all banners
router.get('/getAllBanners', bannerController.getAllBanners);

// Get latest banner
router.get('/getLatestBanner', bannerController.getLatestBanner);

// Update banner
router.put('/update-banner/:id', bannerController.upload.single('banner'), bannerController.updateBanner);

// Delete banner
router.delete('/delete-banner/:id', bannerController.deleteBanner);

module.exports = router;
