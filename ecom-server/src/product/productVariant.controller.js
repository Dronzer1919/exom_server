const multer = require('multer');
const path = require('path');
const ProductVariant = require('./productVariant.model');
const Product = require('./product.model');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all product variants
const getAllVariants = async (req, res) => {
  try {
    const variants = await ProductVariant.find({ isActive: true })
      .populate('product', 'title slug')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      variants,
      total: variants.length
    });
  } catch (error) {
    console.error('Error fetching all variants:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching variants',
      error: error.message
    });
  }
};

// Create a new product variant
const createProductVariant = async (req, res) => {
  try {
    const {
      product,
      name,
      sku,
      price,
      originalPrice,
      inventory,
      attributes,
      specifications,
      weight,
      dimensions,
      isDefault
    } = req.body;

    // Check if product exists
    const existingProduct = await Product.findById(product);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Process uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => ({
        url: `http://localhost:3000/uploads/${file.filename}`,
        alt: name,
        isPrimary: false
      }));
      // Set first image as primary
      if (images.length > 0) images[0].isPrimary = true;
    }

    const variant = new ProductVariant({
      product,
      name,
      sku,
      price,
      originalPrice,
      inventory: JSON.parse(inventory || '{}'),
      attributes: JSON.parse(attributes || '[]'),
      specifications: JSON.parse(specifications || '[]'),
      images,
      weight,
      dimensions: JSON.parse(dimensions || '{}'),
      isDefault: isDefault === 'true'
    });

    await variant.save();

    // Update product to mark it as having variants
    await Product.findByIdAndUpdate(product, {
      hasVariants: true,
      $addToSet: { variants: variant._id }
    });

    // If this is set as default, remove default from other variants
    if (variant.isDefault) {
      await ProductVariant.updateMany(
        { product: product, _id: { $ne: variant._id } },
        { isDefault: false }
      );
    }

    res.status(201).json({
      success: true,
      message: "Product variant created successfully!",
      variant
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "SKU already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Error creating product variant"
    });
  }
};

// Get all variants for a product
const getProductVariants = async (req, res) => {
  try {
    const { productId } = req.params;
    const { includeInactive } = req.query;

    let filter = { product: productId };
    if (!includeInactive) filter.isActive = true;

    const variants = await ProductVariant.find(filter)
      .populate('product', 'title')
      .sort({ isDefault: -1, name: 1 });

    res.status(200).json({
      success: true,
      variants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get variant by ID
const getVariantById = async (req, res) => {
  try {
    const variant = await ProductVariant.findById(req.params.id)
      .populate('product', 'title category subcategory');

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found"
      });
    }

    res.status(200).json({
      success: true,
      variant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update product variant
const updateProductVariant = async (req, res) => {
  try {
    const {
      name,
      sku,
      price,
      originalPrice,
      inventory,
      attributes,
      specifications,
      weight,
      dimensions,
      isDefault,
      isActive
    } = req.body;

    let updateData = {
      name,
      sku,
      price,
      originalPrice,
      inventory: JSON.parse(inventory || '{}'),
      attributes: JSON.parse(attributes || '[]'),
      specifications: JSON.parse(specifications || '[]'),
      weight,
      dimensions: JSON.parse(dimensions || '{}'),
      isDefault: isDefault === 'true',
      isActive: isActive !== 'false',
      updatedAt: new Date()
    };

    // Process new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: `http://localhost:3000/uploads/${file.filename}`,
        alt: name,
        isPrimary: false
      }));
      // Set first new image as primary if no existing primary
      if (newImages.length > 0) newImages[0].isPrimary = true;
      updateData.images = newImages;
    }

    const variant = await ProductVariant.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('product', 'title');

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found"
      });
    }

    // If this is set as default, remove default from other variants
    if (variant.isDefault) {
      await ProductVariant.updateMany(
        { product: variant.product._id, _id: { $ne: variant._id } },
        { isDefault: false }
      );
    }

    res.status(200).json({
      success: true,
      message: "Product variant updated successfully",
      variant
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "SKU already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete product variant
const deleteProductVariant = async (req, res) => {
  try {
    const variant = await ProductVariant.findById(req.params.id);
    
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found"
      });
    }

    // Remove variant from product's variants array
    await Product.findByIdAndUpdate(variant.product, {
      $pull: { variants: variant._id }
    });

    // Check if this was the last variant and update hasVariants
    const remainingVariants = await ProductVariant.countDocuments({ 
      product: variant.product,
      _id: { $ne: variant._id }
    });

    if (remainingVariants === 0) {
      await Product.findByIdAndUpdate(variant.product, {
        hasVariants: false
      });
    }

    await ProductVariant.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product variant deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get variants by attributes (for filtering)
const getVariantsByAttributes = async (req, res) => {
  try {
    const { productId } = req.params;
    const { attributes } = req.query; // JSON string of attribute filters

    let filter = { product: productId, isActive: true };
    
    if (attributes) {
      const attributeFilters = JSON.parse(attributes);
      // Build attribute filters
      const attributeQuery = Object.entries(attributeFilters).map(([name, value]) => ({
        'attributes': {
          $elemMatch: { name, value }
        }
      }));
      
      if (attributeQuery.length > 0) {
        filter.$and = attributeQuery;
      }
    }

    const variants = await ProductVariant.find(filter)
      .populate('product', 'title')
      .sort({ isDefault: -1, price: 1 });

    res.status(200).json({
      success: true,
      variants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get unique attribute values for a product
const getProductAttributes = async (req, res) => {
  try {
    const { productId } = req.params;

    const variants = await ProductVariant.find({ 
      product: productId, 
      isActive: true 
    }).select('attributes');

    const attributeMap = new Map();

    variants.forEach(variant => {
      variant.attributes.forEach(attr => {
        if (!attributeMap.has(attr.name)) {
          attributeMap.set(attr.name, new Set());
        }
        attributeMap.get(attr.name).add(attr.value);
      });
    });

    const attributes = Array.from(attributeMap.entries()).map(([name, values]) => ({
      name,
      values: Array.from(values)
    }));

    res.status(200).json({
      success: true,
      attributes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update variant inventory
const updateVariantInventory = async (req, res) => {
  try {
    const { quantity, lowStockAlert } = req.body;

    const variant = await ProductVariant.findByIdAndUpdate(
      req.params.id,
      {
        'inventory.quantity': quantity,
        'inventory.lowStockAlert': lowStockAlert,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Inventory updated successfully",
      variant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllVariants,
  createProductVariant,
  getProductVariants,
  getVariantById,
  updateProductVariant,
  deleteProductVariant,
  getVariantsByAttributes,
  getProductAttributes,
  updateVariantInventory,
  upload
};
