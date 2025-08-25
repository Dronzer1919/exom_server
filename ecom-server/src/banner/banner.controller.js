const Banner = require('./banner.model');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

exports.upload = upload;

exports.createBanner = async (req, res) => {
  try {
    console.log('Creating banner with file:', req.file);
    console.log('Request body:', req.body);
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No image file uploaded. Please select an image file.' 
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid file type. Only JPG, PNG, and WEBP files are allowed.' 
      });
    }

    // Validate file size (5MB max)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        success: false,
        error: 'File size too large. Maximum size is 5MB.' 
      });
    }
    
    const banner = new Banner({ 
      imageUrl: `/uploads/${req.file.filename}` 
    });
    
    const savedBanner = await banner.save();
    console.log('Banner saved successfully:', savedBanner);
    
    res.status(201).json({
      success: true,
      message: 'Banner uploaded successfully!',
      data: savedBanner
    });
  } catch (err) {
    console.error('Error creating banner:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error: ' + err.message 
    });
  }
};

exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    console.error('Error getting banners:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getLatestBanner = async (req, res) => {
  try {
    const banner = await Banner.findOne().sort({ createdAt: -1 });
    res.json(banner);
  } catch (err) {
    console.error('Error getting latest banner:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;
    const updateData = {};

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
      bannerId, 
      updateData, 
      { new: true }
    );

    if (!updatedBanner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.json({
      success: true,
      message: 'Banner updated successfully',
      data: updatedBanner
    });
  } catch (err) {
    console.error('Error updating banner:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const bannerId = req.params.id;
    
    const banner = await Banner.findById(bannerId);
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    // Delete the file from uploads folder
    if (banner.imageUrl) {
      const filePath = path.join(__dirname, '../../', banner.imageUrl);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileErr) {
        console.error('Error deleting file:', fileErr);
      }
    }

    await Banner.findByIdAndDelete(bannerId);

    res.json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting banner:', err);
    res.status(500).json({ error: err.message });
  }
};
