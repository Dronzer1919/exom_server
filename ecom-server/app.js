// app.js (Main application entry point)
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Import custom middleware
const corsMiddleware = require('./middleware/corsMiddleware');
// const securityMiddleware = require('./middleware/securityMiddleware');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./src/auth/userRoute');
const productRoutes = require('./src/product/product.routes');
const enhancedProductRoutes = require('./src/product/enhancedProduct.routes'); // New enhanced product routes
const categoryRoutes = require('./src/product/category.routes'); // Category management routes
const variantRoutes = require('./src/product/productVariant.routes'); // Product variant routes
// const legacyProductRoutes = require('./src/product/productRoutes'); // Keep legacy routes for compatibility - TEMPORARILY DISABLED
const userRoutes = require('./src/admin/adminRoute');
const bannerRoutes = require('./src/banner/banner.routes');
const blogRoutes = require('./src/blog/blog.routes');
const promoRoutes = require('./src/promo/promo.routes');
const newsletterRoutes = require('./src/newsletter/newsletter.routes');
const homeRoutes = require('./src/home/home.routes');
const cartRoutes = require('./src/cart/cart.routes');

// Initialize environment variables
dotenv.config();

// Initialize express app
const app = express();
require('dotenv').config(); 

// Middleware configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Apply security middleware (XSS protection, Rate limiting, Helmet headers)
// app.use(securityMiddleware);

// Apply CORS middleware
app.use(corsMiddleware);

// Cookie parser - used to support guest cart cookie (HttpOnly)
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Static files setup (uploads directory)
app.use('/uploads', express.static('uploads'));

// Database connection function
const connectToDatabase = async () => {
  const { mongoURI } = require('./config/config');
  try {
    await mongoose.connect(mongoURI);
    console.log('DB connection established');
  } catch (error) {
    console.error('DB connection error:', error.message);
    process.exit(1); // Exit the app if DB connection fails
  }
};

// Initialize database connection
connectToDatabase();

// Routes setup
app.use('/api/products', enhancedProductRoutes); // Enhanced product routes with categories and variants
app.use('/api/categories', categoryRoutes); // Category management routes
app.use('/api/variants', variantRoutes); // Product variant routes
app.use('/api/cart', cartRoutes); // Cart routes
// app.use('/products', legacyProductRoutes); // Legacy product routes (temporarily disabled)
app.use('/api/blogs', blogRoutes); // Blog routes
app.use('/api/promos', promoRoutes); // Promo routes
app.use('/api/newsletter', newsletterRoutes); // Newsletter routes
app.use('/api/home', homeRoutes); // Homepage data routes
app.use('/', require('./routes/index')); // Index route
app.use('/auth', authRoutes); // Authentication routes
app.use('/users', userRoutes); // User/Admin routes
app.use('/', bannerRoutes); // Banner routes

// Error handling middleware
app.use(notFoundHandler); // Handle 404 errors
app.use(errorHandler); // General error handler

// Export the app for use in other modules (e.g., for testing)
module.exports = app;
