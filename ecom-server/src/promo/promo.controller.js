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

    const promo = new Promo({
      title: req.body.title,
      description: req.body.description,
      price: parseFloat(req.body.price),
      originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : null,
      image: {
        url: imageUrl,
        alt: req.body.imageAlt || req.body.title
      },
      link: req.body.link,
      type: req.body.type || 'collection',
      displayOrder: parseInt(req.body.displayOrder) || 0,
      isActive: req.body.isActive !== 'false',
      validFrom: req.body.validFrom ? new Date(req.body.validFrom) : new Date(),
      validUntil: req.body.validUntil ? new Date(req.body.validUntil) : null
    });

    await promo.save();

    res.status(201).json({
      success: true,
      message: "Promo created successfully!",
      data: promo
    });
  } catch (err) {
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
      description: req.body.description,
      price: parseFloat(req.body.price),
      link: req.body.link,
      type: req.body.type,
      displayOrder: parseInt(req.body.displayOrder),
      isActive: req.body.isActive !== 'false',
      updatedAt: new Date()
    };

    // Handle original price
    if (req.body.originalPrice) {
      updateData.originalPrice = parseFloat(req.body.originalPrice);
    }

    // Handle validity dates
    if (req.body.validFrom) {
      updateData.validFrom = new Date(req.body.validFrom);
    }
    if (req.body.validUntil) {
      updateData.validUntil = new Date(req.body.validUntil);
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
      message: 'Promo updated successfully',
      data: updatedPromo
    });
  } catch (error) {
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

module.exports = {
  createPromo,
  getAllPromos,
  getActivePromos,
  getPromoById,
  updatePromo,
  deletePromo,
  upload
};
