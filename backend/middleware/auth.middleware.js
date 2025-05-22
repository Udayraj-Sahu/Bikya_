const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/appError');

// Middleware to verify JWT token
exports.protect = async (req, res, next) => {
  try {
    // 1) Check if token exists
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in. Please log in to get access.', 401)
      );
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    // 4) Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }
    next(error);
  }
};

// Middleware to restrict access based on user roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};

// Middleware to verify if user has approved documents (for regular users)
exports.verifyUserDocuments = async (req, res, next) => {
  try {
    // Admin and owner are exempt from document verification
    if (req.user.role === 'admin' || req.user.role === 'owner') {
      return next();
    }

    // Populate user's documents to check approval status
    const user = await User.findById(req.user.id).populate({
      path: 'documents',
      select: 'status',
    });

    // Check if user has at least one approved document
    const hasApprovedDocument = user.documents.some(
      (doc) => doc.status === 'approved'
    );

    if (!hasApprovedDocument) {
      return next(
        new AppError(
          'You need to have at least one approved document to perform this action.',
          403
        )
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};