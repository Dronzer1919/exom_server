const Blog = require('./blog.model');
const multer = require('multer');
const path = require('path');

// Multer configuration for blog image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/blog');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-blog-' + file.originalname);
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

// Create blog post
const createBlog = async (req, res) => {
  try {
    const imageUrl = req.file 
      ? `http://localhost:3000/uploads/blog/${req.file.filename}`
      : null;

    const blog = new Blog({
      title: req.body.title,
      excerpt: req.body.excerpt,
      content: req.body.content,
      author: {
        name: req.body.authorName,
        email: req.body.authorEmail,
        avatar: req.body.authorAvatar
      },
      image: {
        url: imageUrl,
        alt: req.body.imageAlt || req.body.title
      },
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      category: req.body.category,
      featured: req.body.featured === 'true',
      status: req.body.status || 'draft',
      seo: {
        metaTitle: req.body.metaTitle,
        metaDescription: req.body.metaDescription,
        slug: req.body.slug || req.body.title.toLowerCase().replace(/\s+/g, '-')
      },
      publishedAt: req.body.status === 'published' ? new Date() : null
    });

    await blog.save();

    res.status(201).json({
      success: true,
      message: "Blog post created successfully!",
      data: blog
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || "Some error occurred while creating the blog post."
    });
  }
};

// Get all blog posts with filtering and pagination
const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    } else {
      filter.status = 'published'; // Default to published only
    }
    
    if (req.query.featured === 'true') filter.featured = true;
    if (req.query.category) filter.category = req.query.category;

    // Build sort object
    let sort = {};
    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
      sort[sortField] = sortOrder;
    } else {
      sort.publishedAt = -1; // Default sort by newest published
    }

    const blogs = await Blog.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: blogs,
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

// Get featured blog posts for homepage
const getFeaturedBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 2;
    
    const blogs = await Blog.find({ 
      featured: true, 
      status: 'published' 
    })
    .sort({ publishedAt: -1 })
    .limit(limit);

    res.status(200).json({
      success: true,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get latest blog posts for homepage
const getLatestBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 2;
    
    const blogs = await Blog.find({ 
      status: 'published' 
    })
    .sort({ publishedAt: -1 })
    .limit(limit);

    res.status(200).json({
      success: true,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single blog post by ID or slug
const getBlogById = async (req, res) => {
  try {
    const identifier = req.params.id;
    let blog;

    // Try to find by ID first, then by slug
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(identifier);
    } else {
      blog = await Blog.findOne({ 'seo.slug': identifier, status: 'published' });
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update blog post
const updateBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    
    const updateData = {
      title: req.body.title,
      excerpt: req.body.excerpt,
      content: req.body.content,
      category: req.body.category,
      featured: req.body.featured === 'true',
      status: req.body.status,
      updatedAt: new Date()
    };

    // Handle file upload
    if (req.file) {
      updateData.image = {
        url: `http://localhost:3000/uploads/blog/${req.file.filename}`,
        alt: req.body.imageAlt || req.body.title
      };
    }

    // Handle tags
    if (req.body.tags) {
      updateData.tags = req.body.tags.split(',').map(tag => tag.trim());
    }

    // Handle author updates
    if (req.body.authorName) {
      updateData.author = {
        name: req.body.authorName,
        email: req.body.authorEmail,
        avatar: req.body.authorAvatar
      };
    }

    // Handle SEO updates
    if (req.body.metaTitle || req.body.metaDescription || req.body.slug) {
      updateData.seo = {
        metaTitle: req.body.metaTitle,
        metaDescription: req.body.metaDescription,
        slug: req.body.slug
      };
    }

    // Set publishedAt if status is being changed to published
    if (req.body.status === 'published' && req.body.status !== req.body.previousStatus) {
      updateData.publishedAt = new Date();
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      data: updatedBlog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete blog post
const deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    
    const deletedBlog = await Blog.findByIdAndDelete(blogId);
    
    if (!deletedBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getFeaturedBlogs,
  getLatestBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  upload
};
