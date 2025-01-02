// /middleware/securityMiddleware.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xssClean = require('xss-clean');

// XSS Protection
const xssProtection = xssClean();

// Rate Limiting (100 requests per 15-minute window)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs (15 minutes)
  message: 'Too many requests, please try again later.',
  standardHeaders: true, // Include rate limit info in the response headers
  legacyHeaders: false,  // Disable the X-RateLimit-* headers (optional)
});

// Helmet - Set security-related HTTP headers
const securityHeaders = helmet();

module.exports = [xssProtection, limiter, securityHeaders];
