// /middleware/errorHandler.js
const createError = require('http-errors');

// Catch 404 errors
const notFoundHandler = (req, res, next) => {
  next(createError(404));
};

// General error handler
const errorHandler = (err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {}; // Show detailed errors only in development

  res.status(err.status || 500);
  res.json({
    message: 'An error occurred, please try again later.',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
};

module.exports = { notFoundHandler, errorHandler };
