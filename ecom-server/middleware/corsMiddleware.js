// /middleware/corsMiddleware.js
const cors = require('cors');

const corsOptions = {
  origin: ['http://localhost:4200' , 'http://localhost:3000'],  // Replace with your frontend's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowable HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Allowed headers
  credentials: true,  // Allow cookies (if needed)
  preflightContinue: false, // Handle preflight requests automatically
  optionsSuccessStatus: 204, // Success status for OPTIONS request (for legacy browsers)
};

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware;
