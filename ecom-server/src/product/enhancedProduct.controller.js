const multer = require('multer');
const path = require('path');
const Product = require('./product.model');
const Category = require('./category.model');
const ProductVariant = require('./productVariant.model');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Create a new product with enhanced features
const createProduct = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      shortDescription,
      price,
      originalPrice,
      category,
      subcategory,
      brand,
      specifications,
      features,
      technicalSpecs,
      badge,
      inventory,
      tags,
      featured,
      topRated,
      status,
      seo,
      relatedProducts,
      crossSellProducts
    } = req.body;

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID"
      });
    }

    // Verify subcategory exists if provided
    if (subcategory) {
      const subcategoryExists = await Category.findById(subcategory);
      if (!subcategoryExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid subcategory ID"
        });
      }
    }

    // Process uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file, index) => ({
        url: `http://localhost:3000/uploads/${file.filename}`,
        alt: title,
        isPrimary: index === 0
      }));
    }

    // Handle inventory - support both JSON format and individual fields
    let inventoryData = {};
    if (inventory) {
      // If inventory is sent as JSON string
      inventoryData = JSON.parse(inventory);
    } else {
      // If inventory is sent as individual fields (for compatibility with admin frontend)
      inventoryData = {
        quantity: parseInt(req.body.quantity) || 0,
        sku: req.body.sku || '',
        weight: parseFloat(req.body.weight) || 0
      };
    }

    // Handle SEO - support both JSON format and individual fields
    let seoData = {};
    if (seo) {
      // If seo is sent as JSON string
      seoData = JSON.parse(seo);
    } else {
      // If seo is sent as individual fields (for compatibility with admin frontend)
      seoData = {
        metaTitle: req.body.metaTitle || '',
        metaDescription: req.body.metaDescription || '',
        slug: req.body.slug || ''
      };
    }

    const product = new Product({
      title,
      subtitle,
      description,
      shortDescription,
      price,
      originalPrice,
      category,
      subcategory: subcategory || null,
      brand,
      images,
      specifications: JSON.parse(specifications || '[]'),
      features: JSON.parse(features || '[]'),
      technicalSpecs: JSON.parse(technicalSpecs || '[]'),
      badge,
      inventory: inventoryData,
      tags: tags ? (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : JSON.parse(tags || '[]')) : [],
      featured: featured === 'true',
      topRated: topRated === 'true',
      status: status || 'active',
      seo: seoData,
      relatedProducts: JSON.parse(relatedProducts || '[]'),
      crossSellProducts: JSON.parse(crossSellProducts || '[]')
    });

    await product.save();

    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('relatedProducts', 'title price images')
      .populate('crossSellProducts', 'title price images');

    res.status(201).json({
      success: true,
      message: "Product created successfully!",
      product: populatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error creating product"
    });
  }
};

// Get all products with advanced filtering
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      featured,
      topRated,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    let filter = {};
    
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (status) filter.status = status;
    else filter.status = 'active'; // Default to active products
    
    if (featured !== undefined) filter.featured = featured === 'true';
    if (topRated !== undefined) filter.topRated = topRated === 'true';
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('variants')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get product by ID with full details
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate({
        path: 'variants',
        match: { isActive: true },
        options: { sort: { isDefault: -1, name: 1 } }
      })
      .populate('relatedProducts', 'title price originalPrice images rating badge')
      .populate('crossSellProducts', 'title price originalPrice images rating badge');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get product by slug
const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ 'seo.slug': req.params.slug })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate({
        path: 'variants',
        match: { isActive: true },
        options: { sort: { isDefault: -1, name: 1 } }
      })
      .populate('relatedProducts', 'title price originalPrice images rating badge')
      .populate('crossSellProducts', 'title price originalPrice images rating badge');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      product
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
    const {
      title,
      subtitle,
      description,
      shortDescription,
      price,
      originalPrice,
      category,
      subcategory,
      brand,
      specifications,
      features,
      technicalSpecs,
      badge,
      inventory,
      tags,
      featured,
      topRated,
      status,
      seo,
      relatedProducts,
      crossSellProducts
    } = req.body;

    // Handle inventory - support both JSON format and individual fields
    let inventoryData = {};
    if (inventory) {
      // If inventory is sent as JSON string
      inventoryData = JSON.parse(inventory);
    } else {
      // If inventory is sent as individual fields (for compatibility with admin frontend)
      inventoryData = {
        quantity: parseInt(req.body.quantity) || 0,
        sku: req.body.sku || '',
        weight: parseFloat(req.body.weight) || 0
      };
    }

    // Handle SEO - support both JSON format and individual fields
    let seoData = {};
    if (seo) {
      // If seo is sent as JSON string
      seoData = JSON.parse(seo);
    } else {
      // If seo is sent as individual fields (for compatibility with admin frontend)
      seoData = {
        metaTitle: req.body.metaTitle || '',
        metaDescription: req.body.metaDescription || '',
        slug: req.body.slug || ''
      };
    }

    let updateData = {
      title,
      subtitle,
      description,
      shortDescription,
      price,
      originalPrice,
      category,
      subcategory: subcategory || null,
      brand,
      specifications: JSON.parse(specifications || '[]'),
      features: JSON.parse(features || '[]'),
      technicalSpecs: JSON.parse(technicalSpecs || '[]'),
      badge,
      inventory: inventoryData,
      tags: tags ? (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : JSON.parse(tags || '[]')) : [],
      featured: featured === 'true',
      topRated: topRated === 'true',
      status: status || 'active',
      seo: seoData,
      relatedProducts: JSON.parse(relatedProducts || '[]'),
      crossSellProducts: JSON.parse(crossSellProducts || '[]'),
      updatedAt: new Date()
    };

    // Process new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: `http://localhost:3000/uploads/${file.filename}`,
        alt: title,
        isPrimary: index === 0
      }));
      updateData.images = newImages;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug')
     .populate('subcategory', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product
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
    // Delete all variants first
    await ProductVariant.deleteMany({ product: req.params.id });
    
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Product and all variants deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find({ 
      category: categoryId, 
      status: 'active' 
    })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalProducts = await Product.countDocuments({ 
      category: categoryId, 
      status: 'active' 
    });

    res.status(200).json({
      success: true,
      products,
      totalProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProducts / parseInt(limit)),
        totalProducts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get featured products
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const products = await Product.find({ 
      featured: true, 
      status: 'active' 
    })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get top rated products
const getTopRatedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const products = await Product.find({ 
      topRated: true, 
      status: 'active' 
    })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort({ 'rating.average': -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      products
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
    const { q, page = 1, limit = 12 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const searchFilter = {
      status: 'active',
      $or: [
        { title: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { tags: new RegExp(q, 'i') },
        { brand: new RegExp(q, 'i') }
      ]
    };

    const products = await Product.find(searchFilter)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort({ 'rating.average': -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalProducts = await Product.countDocuments(searchFilter);

    res.status(200).json({
      success: true,
      products,
      searchQuery: q,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProducts / parseInt(limit)),
        totalProducts
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
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getFeaturedProducts,
  getTopRatedProducts,
  searchProducts,
  upload
};
