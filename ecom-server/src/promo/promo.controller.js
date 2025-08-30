const Promo = require('./promo.model');
const multer = require('multer');

// Multer configuration for promo image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/promo');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-promo-' + file.originalname);
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

// Create promo
const createPromo = async (req, res) => {
  try {
    const imageUrl = req.file 
      ? `http://localhost:3000/uploads/promo/${req.file.filename}`
      : null;

    // Validate required fields
    if (!req.body.title || !req.body.discountType) {
      return res.status(400).json({
        success: false,
        message: "Title and discount type are required"
      });
    }

    // Validate date range
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    
    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date"
      });
    }

    const promo = new Promo({
      title: req.body.title,
      subtitle: req.body.subtitle || '',
      description: req.body.description || '',
      discountType: req.body.discountType,
      discountValue: req.body.discountValue ? parseFloat(req.body.discountValue) : 0,
      code: req.body.code || null,
      minOrderValue: req.body.minOrderValue ? parseFloat(req.body.minOrderValue) : 0,
      
      // Legacy fields for backward compatibility - handle NaN values
      price: req.body.price && !isNaN(parseFloat(req.body.price)) ? parseFloat(req.body.price) : 0,
      originalPrice: req.body.originalPrice && !isNaN(parseFloat(req.body.originalPrice)) ? parseFloat(req.body.originalPrice) : null,
      
      image: imageUrl ? {
        url: imageUrl,
        alt: req.body.imageAlt || req.body.title
      } : undefined,
      
      // Usage limits
      usageLimit: req.body.usageLimit ? parseInt(req.body.usageLimit) : 0,
      perUserLimit: req.body.perUserLimit ? parseInt(req.body.perUserLimit) : 1,
      
      // Timing
      startDate: startDate,
      endDate: endDate,
      
      // Targeting
      targetAudience: req.body.targetAudience || 'all',
      
      // Settings
      featured: req.body.featured === 'true' || req.body.featured === true,
      combinable: req.body.combinable === 'true' || req.body.combinable === true,
      status: req.body.status || 'active',
      
      // Call to Action
      buttonText: req.body.buttonText || 'Shop Now',
      buttonLink: req.body.buttonLink || '#',
      
      // Legacy fields - ensure link has a default value
      link: req.body.buttonLink || req.body.link || '#',
      type: req.body.type || 'deal',
      displayOrder: parseInt(req.body.displayOrder) || 0,
      isActive: req.body.status !== 'inactive' && req.body.status !== 'expired'
    });

    await promo.save();

    res.status(201).json({
      success: true,
      message: "Promo created successfully! Currency: ₹ (Rupees)",
      data: promo
    });
  } catch (err) {
    console.error('Create promo error:', err);
    res.status(500).json({
      success: false,
      message: err.message || "Some error occurred while creating the promo."
    });
  }
};

// Get all promos
const getAllPromos = async (req, res) => {
  try {
    const filter = {};
    
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    if (req.query.type) {
      filter.type = req.query.type;
    }

    // Filter by validity period
    const now = new Date();
    if (req.query.valid === 'true') {
      filter.validFrom = { $lte: now };
      filter.$or = [
        { validUntil: { $gte: now } },
        { validUntil: null }
      ];
    }

    const promos = await Promo.find(filter)
      .sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: promos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get active promos for homepage
const getActivePromos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const now = new Date();
    
    const promos = await Promo.find({
      isActive: true,
      validFrom: { $lte: now },
      $or: [
        { validUntil: { $gte: now } },
        { validUntil: null }
      ]
    })
    .sort({ displayOrder: 1 })
    .limit(limit);

    res.status(200).json({
      success: true,
      data: promos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single promo by ID
const getPromoById = async (req, res) => {
  try {
    const promo = await Promo.findById(req.params.id);

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Promo not found'
      });
    }

    res.status(200).json({
      success: true,
      data: promo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update promo
const updatePromo = async (req, res) => {
  try {
    const promoId = req.params.id;
    
    const updateData = {
      title: req.body.title,
      subtitle: req.body.subtitle,
      description: req.body.description,
      discountType: req.body.discountType,
      discountValue: req.body.discountValue ? parseFloat(req.body.discountValue) : 0,
      code: req.body.code,
      minOrderValue: req.body.minOrderValue ? parseFloat(req.body.minOrderValue) : 0,
      
      // Legacy fields - handle NaN values
      price: req.body.price && !isNaN(parseFloat(req.body.price)) ? parseFloat(req.body.price) : 0,
      
      // Usage limits
      usageLimit: req.body.usageLimit ? parseInt(req.body.usageLimit) : 0,
      perUserLimit: req.body.perUserLimit ? parseInt(req.body.perUserLimit) : 1,
      
      // Timing
      startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      
      // Targeting
      targetAudience: req.body.targetAudience,
      
      // Settings
      featured: req.body.featured === 'true' || req.body.featured === true,
      combinable: req.body.combinable === 'true' || req.body.combinable === true,
      status: req.body.status,
      
      // Call to Action
      buttonText: req.body.buttonText,
      buttonLink: req.body.buttonLink,
      
      // Legacy fields - ensure link has a value
      link: req.body.buttonLink || req.body.link || '#',
      type: req.body.type || 'deal',
      displayOrder: req.body.displayOrder && !isNaN(parseInt(req.body.displayOrder)) ? parseInt(req.body.displayOrder) : 0,
      isActive: req.body.status === 'active',
      updatedAt: new Date()
    };

    // Handle original price
    if (req.body.originalPrice) {
      updateData.originalPrice = parseFloat(req.body.originalPrice);
    }

    // Handle validity dates (legacy)
    if (req.body.validFrom) {
      updateData.validFrom = new Date(req.body.validFrom);
    }
    if (req.body.validUntil) {
      updateData.validUntil = new Date(req.body.validUntil);
    }

    // Validate date range if both dates are provided
    if (updateData.startDate && updateData.endDate && updateData.endDate <= updateData.startDate) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date"
      });
    }

    // Handle file upload
    if (req.file) {
      updateData.image = {
        url: `http://localhost:3000/uploads/promo/${req.file.filename}`,
        alt: req.body.imageAlt || req.body.title
      };
    }

    const updatedPromo = await Promo.findByIdAndUpdate(
      promoId, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedPromo) {
      return res.status(404).json({
        success: false,
        message: 'Promo not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Promo updated successfully! Currency: ₹ (Rupees)',
      data: updatedPromo
    });
  } catch (error) {
    console.error('Update promo error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete promo
const deletePromo = async (req, res) => {
  try {
    const promoId = req.params.id;
    
    const deletedPromo = await Promo.findByIdAndDelete(promoId);
    
    if (!deletedPromo) {
      return res.status(404).json({
        success: false,
        message: 'Promo not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Promo deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Validate promo code
const validatePromoCode = async (req, res) => {
  try {
    const { code, orderValue } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required'
      });
    }

    const now = new Date();
    const promo = await Promo.findOne({
      code: code.toUpperCase(),
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired promo code'
      });
    }

    // Check usage limit
    if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Promo code usage limit exceeded'
      });
    }

    // Check minimum order value
    if (orderValue && promo.minOrderValue > 0 && orderValue < promo.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value is ₹${promo.minOrderValue}`
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      discountAmount = (orderValue * promo.discountValue) / 100;
    } else if (promo.discountType === 'fixed') {
      discountAmount = promo.discountValue;
    }

    res.status(200).json({
      success: true,
      message: 'Valid promo code',
      data: {
        promo,
        discountAmount: discountAmount,
        currency: '₹'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Apply promo code (increment usage count)
const applyPromoCode = async (req, res) => {
  try {
    const { code } = req.body;
    
    const promo = await Promo.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } },
      { new: true }
    );

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Promo code applied successfully',
      data: promo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createPromo,
  getAllPromos,
  getActivePromos,
  getPromoById,
  updatePromo,
  deletePromo,
  validatePromoCode,
  applyPromoCode,
  upload
};
