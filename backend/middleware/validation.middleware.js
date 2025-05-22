// backend/middleware/validation.middleware.js
const { validationResult } = require('express-validator');
const AppError = require('../utils/appError'); // Adjust path if necessary

exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // You can format the errors as you like.
    // Here, we'll take the first error message.
    const errorMessage = errors.array().map(err => err.msg).join(', ');
    return next(new AppError(errorMessage, 400)); // 400 Bad Request
  }
  next();
};