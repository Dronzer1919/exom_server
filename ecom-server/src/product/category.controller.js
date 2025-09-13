const multer = require('multer');
const path = require('path');
const Category = require('./category.model');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Create a new category
const createCategory = async (req, res) => {
  try {
    console.log('Request body:', req.body); // Debug logging
    console.log('Request file:', req.file); // Debug logging
    const { name, description, parentCategory, level, sortOrder, isActive, seo } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }
    
    let imageUrl = null;
    if (req.file) {
      imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    }

    console.log('Creating category with data:', {
      name,
      description,
      parentCategory: parentCategory || null,
      level: level || 0,
      sortOrder: sortOrder || 0,
      isActive: isActive !== undefined ? isActive : true
    }); // Debug logging

    // Generate slug manually as fallback
    const slug = name.toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .trim();

    const category = new Category({
      name,
      slug, // Explicitly set the slug
      description,
      image: imageUrl,
      parentCategory: parentCategory || null,
      level: level || 0,
      sortOrder: sortOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
      seo: seo || {}
    });

    console.log('Category before save:', category); // Debug logging
    await category.save();
    console.log('Category after save:', category); // Debug logging
    
    res.status(201).json({
      success: true,
      message: "Category created successfully!",
      category
    });
  } catch (error) {
    console.error('Category creation error:', error); // Debug logging
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Error creating category"
    });
  }
};

// Get all categories with hierarchy
const getAllCategories = async (req, res) => {
  try {
    const { level, parentCategory, includeInactive } = req.query;
    
    let filter = {};
    if (level !== undefined) filter.level = parseInt(level);
    if (parentCategory) filter.parentCategory = parentCategory;
    if (!includeInactive) filter.isActive = true;

    const categories = await Category.find(filter)
      .populate('parentCategory', 'name slug')
      .populate('subcategories')
      .sort({ sortOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get categories tree structure
const getCategoriesTree = async (req, res) => {
  try {
    const mainCategories = await Category.find({ level: 0, isActive: true })
      .sort({ sortOrder: 1, name: 1 });

    const buildTree = async (categories) => {
      const tree = [];
      for (const category of categories) {
        const subcategories = await Category.find({ 
          parentCategory: category._id, 
          isActive: true 
        }).sort({ sortOrder: 1, name: 1 });
        
        const categoryObj = category.toObject();
        if (subcategories.length > 0) {
          categoryObj.children = await buildTree(subcategories);
        }
        tree.push(categoryObj);
      }
      return tree;
    };

    const categoriesTree = await buildTree(mainCategories);

    res.status(200).json({
      success: true,
      categoriesTree
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory', 'name slug')
      .populate('subcategories');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get category by slug
const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug })
      .populate('parentCategory', 'name slug')
      .populate('subcategories');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { name, description, parentCategory, level, sortOrder, isActive, seo } = req.body;
    
    let updateData = {
      name,
      description,
      parentCategory: parentCategory || null,
      level: level || 0,
      sortOrder: sortOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
      seo: seo || {},
      updatedAt: new Date()
    };

    // Generate slug if name is being updated
    if (name) {
      updateData.slug = name.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
        .trim();
    }

    if (req.file) {
      updateData.image = `http://localhost:3000/uploads/${req.file.filename}`;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name slug');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists"
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    // Check if category has subcategories
    const hasSubcategories = await Category.findOne({ parentCategory: req.params.id });
    if (hasSubcategories) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category that has subcategories"
      });
    }

    // TODO: Check if category has products (implement when integrating with products)
    
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get subcategories by parent category ID
const getSubcategories = async (req, res) => {
  try {
    const subcategories = await Category.find({ 
      parentCategory: req.params.parentId,
      isActive: true 
    }).sort({ sortOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      subcategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reorder categories
const reorderCategories = async (req, res) => {
  try {
    const { categoryIds } = req.body; // Array of category IDs in new order

    const updatePromises = categoryIds.map((id, index) => {
      return Category.findByIdAndUpdate(id, { sortOrder: index });
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Categories reordered successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoriesTree,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  getSubcategories,
  reorderCategories,
  upload
};
