const Blog = require('./blog.model');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure blog uploads directory exists
const blogUploadsDir = './uploads/blog';
if (!fs.existsSync(blogUploadsDir)){
  fs.mkdirSync(blogUploadsDir, { recursive: true });
}

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
    console.log('Creating blog with data:', req.body);
    console.log('File uploaded:', req.file);

    const imageUrl = req.file 
      ? `http://localhost:3000/uploads/blog/${req.file.filename}`
      : null;

    const blogData = {
      title: req.body.title,
      excerpt: req.body.excerpt || req.body.title, // Use title as fallback for excerpt
      content: req.body.content,
      author: {
        name: req.body.authorName || 'Admin',
        email: req.body.authorEmail || 'admin@example.com',
        avatar: req.body.authorAvatar
      },
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      category: req.body.category || 'design',
      featured: req.body.featured === 'true',
      status: req.body.status || 'draft',
      seo: {
        metaTitle: req.body.metaTitle || req.body.title,
        metaDescription: req.body.metaDescription || req.body.excerpt || req.body.title,
        slug: req.body.slug || (req.body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + Date.now())
      },
      publishedAt: req.body.status === 'published' ? new Date() : null
    };

    // Only add image if one was uploaded
    if (imageUrl) {
      blogData.image = {
        url: imageUrl,
        alt: req.body.imageAlt || req.body.title
      };
    }

    const blog = new Blog(blogData);
    await blog.save();

    console.log('Blog created successfully:', blog);

    res.status(201).json({
      success: true,
      message: "Blog post created successfully!",
      data: blog
    });
  } catch (err) {
    console.error('Error creating blog:', err);
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
    
    // For admin panel, show all posts unless specifically filtered
    if (req.query.status) {
      filter.status = req.query.status;
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
      sort.createdAt = -1; // Default sort by newest created
    }

    const blogs = await Blog.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(filter);

    console.log(`Found ${blogs.length} blogs out of ${total} total`);

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
    console.error('Error fetching blogs:', error);
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
    
    console.log('Updating blog with ID:', blogId);
    console.log('Update data:', req.body);
    console.log('File uploaded:', req.file);
    
    const updateData = {
      title: req.body.title,
      excerpt: req.body.excerpt || '',
      content: req.body.content,
      category: req.body.category || 'design',
      featured: req.body.featured === 'true',
      status: req.body.status || 'draft',
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
    if (req.body.authorName || req.body.author) {
      updateData.author = {
        name: req.body.authorName || req.body.author || 'Admin',
        email: req.body.authorEmail || 'admin@example.com',
        avatar: req.body.authorAvatar
      };
    }

    // Handle SEO updates
    if (req.body.metaTitle || req.body.metaDescription || req.body.slug) {
      updateData.seo = {
        metaTitle: req.body.metaTitle || req.body.title,
        metaDescription: req.body.metaDescription || req.body.excerpt,
        slug: req.body.slug || req.body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      };
    }

    // Set publishedAt if status is being changed to published
    if (req.body.status === 'published') {
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

    console.log('Blog updated successfully:', updatedBlog);

    res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      data: updatedBlog
    });
  } catch (error) {
    console.error('Error updating blog:', error);
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
