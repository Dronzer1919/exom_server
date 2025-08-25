const Product = require('./product.model');
const ProductCategory = require('./productCategory.model');
const multer = require('multer');
const path = require('path');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Check file type
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

// Create a new product
const createProduct = async (req, res) => {
  try {
    const images = req.files ? req.files.map((file, index) => ({
      url: `http://localhost:3000/uploads/${file.filename}`,
      alt: req.body.title || 'Product image',
      isPrimary: index === 0
    })) : [];

    const product = new Product({
      title: req.body.title,
      subtitle: req.body.subtitle,
      description: req.body.description,
      price: parseFloat(req.body.price),
      originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : null,
      category: req.body.category,
      subcategory: req.body.subcategory,
      images: images,
      badge: req.body.badge,
      inventory: {
        quantity: parseInt(req.body.quantity) || 0,
        sku: req.body.sku,
        weight: parseFloat(req.body.weight) || null,
        dimensions: {
          length: parseFloat(req.body.length) || null,
          width: parseFloat(req.body.width) || null,
          height: parseFloat(req.body.height) || null
        }
      },
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      featured: req.body.featured === 'true',
      topRated: req.body.topRated === 'true',
      seo: {
        metaTitle: req.body.metaTitle,
        metaDescription: req.body.metaDescription,
        slug: req.body.slug || req.body.title.toLowerCase().replace(/\s+/g, '-')
      }
    });

    await product.save();
    await product.populate('category');

    res.status(201).json({
      success: true,
      message: "Product created successfully!",
      data: product
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Some error occurred while creating the product."
    });
  }
};

// Get all products with filtering and pagination
const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { status: 'active' };
    
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured === 'true') filter.featured = true;
    if (req.query.topRated === 'true') filter.topRated = true;
    if (req.query.badge) filter.badge = req.query.badge;
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Build sort object
    let sort = {};
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[sortField] = sortOrder;
    } else {
      sort.createdAt = -1; // Default sort by newest
    }

    const products = await Product.find(filter)
      .populate('category', 'categoryName')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get featured products for homepage
const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const products = await Product.find({ 
      featured: true, 
      status: 'active' 
    })
    .populate('category', 'categoryName')
    .sort({ createdAt: -1 })
    .limit(limit);

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get top rated products for homepage
const getTopRatedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    
    const products = await Product.find({ 
      status: 'active',
      'rating.average': { $gte: 4 }
    })
    .populate('category', 'categoryName')
    .sort({ 'rating.average': -1, 'rating.count': -1 })
    .limit(limit);

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'categoryName description');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Build update object
    const updateData = {
      title: req.body.title,
      subtitle: req.body.subtitle,
      description: req.body.description,
      price: parseFloat(req.body.price),
      category: req.body.category,
      subcategory: req.body.subcategory,
      badge: req.body.badge,
      featured: req.body.featured === 'true',
      topRated: req.body.topRated === 'true',
      updatedAt: new Date()
    };

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file, index) => ({
        url: `http://localhost:3000/uploads/${file.filename}`,
        alt: req.body.title || 'Product image',
        isPrimary: index === 0
      }));
    }

    // Handle inventory updates
    if (req.body.quantity !== undefined) {
      updateData['inventory.quantity'] = parseInt(req.body.quantity);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('category');

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    const deletedProduct = await Product.findByIdAndDelete(productId);
    
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Search products
const searchProducts = async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const filter = {
      status: 'active',
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    };

    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(filter)
      .populate('category', 'categoryName')
      .sort({ 'rating.average': -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getFeaturedProducts,
  getTopRatedProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  upload
};
