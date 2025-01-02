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
const productRoutes = require('./src/product/productRoutes');
const userRoutes = require('./src/admin/adminRoute')

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

// Static files setup (uploads directory)
app.use(express.static('uploads'));

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
app.use('/products', productRoutes);
app.use('/', require('./routes/index')); // Index route
app.use('/auth', authRoutes); // Authentication routes
app.use('/users', userRoutes);

// Error handling middleware
app.use(notFoundHandler); // Handle 404 errors
app.use(errorHandler); // General error handler

// Export the app for use in other modules (e.g., for testing)
module.exports = app;
