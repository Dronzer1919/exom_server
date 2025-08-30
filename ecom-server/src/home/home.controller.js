const Product = require('../product/product.model');
const Blog = require('../blog/blog.model');
const Promo = require('../promo/promo.model');
const Banner = require('../banner/banner.model');

// Get all homepage data in a single API call
const getHomepageData = async (req, res) => {
  try {
    // Get featured products (limit 5)
    const featuredProducts = await Product.find({ 
      featured: true, 
      status: 'active' 
    })
    .populate('category', 'categoryName')
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title price images rating badge');

    // Get top rated products (limit 4)
    const topRatedProducts = await Product.find({ 
      status: 'active',
      'rating.average': { $gte: 4 }
    })
    .populate('category', 'categoryName')
    .sort({ 'rating.average': -1, 'rating.count': -1 })
    .limit(4)
    .select('title price images rating');

    // Get active promo cards (limit 3)
    const now = new Date();
    const promoCards = await Promo.find({
      isActive: true,
      validFrom: { $lte: now },
      $or: [
        { validUntil: { $gte: now } },
        { validUntil: null }
      ]
    })
    .sort({ displayOrder: 1 })
    .limit(3)
    .select('title price image link');

    // Get latest blog posts (show all published blogs)
    const blogPosts = await Blog.find({ 
      status: 'published' 
    })
    .sort({ publishedAt: -1 })
    .select('title excerpt image publishedAt seo.slug');

    // Get all active banners
    const banners = await Banner.find()
      .sort({ createdAt: -1 })
      .select('imageUrl');

    // Transform data to match frontend structure
    const transformedFeaturedProducts = featuredProducts.map(product => ({
      id: product._id,
      title: product.title,
      price: product.price,
      image: product.images.find(img => img.isPrimary)?.url || product.images[0]?.url,
      rating: product.rating?.average || 0,
      badge: product.badge
    }));

    const transformedTopRated = topRatedProducts.map(product => ({
      id: product._id,
      title: product.title,
      price: product.price,
      image: product.images.find(img => img.isPrimary)?.url || product.images[0]?.url,
      rating: product.rating?.average || 0
    }));

    const transformedPromoCards = promoCards.map(promo => ({
      id: promo._id,
      title: promo.title,
      price: promo.price,
      image: promo.image?.url,
      link: promo.link
    }));

    const transformedBlogCards = blogPosts.map(blog => ({
      id: blog._id,
      title: blog.title,
      excerpt: blog.excerpt,
      image: blog.image?.url,
      date: blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }) : '',
      slug: blog.seo?.slug
    }));

    res.status(200).json({
      success: true,
      data: {
        hero: {
          banners: banners.map(banner => banner.imageUrl),
          banner: banners.length > 0 ? banners[0].imageUrl : null, // Keep for backward compatibility
          title: "Indoor Lighting",
          subtitle: "Decorative",
          description: "Huge site-wide sale up to 50% off all interior lamps.",
          ctaButtons: [
            { text: "Shop Now", link: "/products", type: "primary" },
            { text: "View Deals", link: "/deals", type: "secondary" }
          ]
        },
        promoCards: transformedPromoCards,
        featuredProducts: transformedFeaturedProducts,
        topRatedProducts: transformedTopRated,
        blogCards: transformedBlogCards,
        testimonial: {
          text: "We came to the very best in quality materials and premium goods.",
          link: "/testimonials"
        },
        features: [
          {
            icon: "bi-truck",
            title: "Fast Delivery",
            description: "Speedy shipping on all orders."
          },
          {
            icon: "bi-shield-check",
            title: "Secure Checkout",
            description: "Encrypted payments and safety."
          },
          {
            icon: "bi-stars",
            title: "Member Discount",
            description: "Exclusive prices for members."
          }
        ],
        navLinks: ['Home', 'Products', 'Accessories', 'Lighting', 'Blog', 'Contact']
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get products by category for navigation
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { status: 'active' };
    
    if (category && category !== 'all') {
      // Find category by name
      const ProductCategory = require('../product/productCategory.model');
      const categoryDoc = await ProductCategory.findOne({ 
        categoryName: new RegExp(category, 'i') 
      });
      
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      }
    }

    const products = await Product.find(filter)
      .populate('category', 'categoryName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    const transformedProducts = products.map(product => ({
      id: product._id,
      title: product.title,
      subtitle: product.subtitle,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images.find(img => img.isPrimary)?.url || product.images[0]?.url,
      rating: product.rating?.average || 0,
      badge: product.badge,
      category: product.category?.categoryName
    }));

    res.status(200).json({
      success: true,
      data: transformedProducts,
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

// Get deal products (products with discounts)
const getDealProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { 
      status: 'active',
      originalPrice: { $exists: true, $ne: null },
      $expr: { $lt: ['$price', '$originalPrice'] }
    };

    const products = await Product.find(filter)
      .populate('category', 'categoryName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    const transformedProducts = products.map(product => {
      const discount = product.originalPrice 
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;
      
      return {
        id: product._id,
        title: product.title,
        subtitle: product.subtitle,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: discount,
        image: product.images.find(img => img.isPrimary)?.url || product.images[0]?.url,
        rating: product.rating?.average || 0,
        badge: product.badge,
        category: product.category?.categoryName
      };
    });

    res.status(200).json({
      success: true,
      data: transformedProducts,
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

module.exports = {
  getHomepageData,
  getProductsByCategory,
  getDealProducts
};
